import type { OldSignal } from './OldSignal'
import { singleSelector } from './singleSelector';

//
//

export function oldSelector<T extends OldSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is?: typeof Object.is,
): OldSignal<U>;

//

export function oldSelector<
  E extends OldSignal<any>,
  T extends Readonly<[E, ...E[]]>,
  U,
>(
  from: T,
  getter: (values: SignalValue<E>) => U,
  is?: typeof Object.is,
): OldSignal<U>;

//
//

export function oldSelector(
  from: OldSignal<any> | OldSignal<any>[],
  getter: (values: any) => any,
  is = Object.is,
): OldSignal<any> {
  return Array.isArray(from)
    ? multiSelector(from as any, getter, is)
    : singleSelector(from, getter, is);
}

//
//

/** One or more values from `Signal` stores. */
export type SignalValue<T> =
  T extends OldSignal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends OldSignal<infer U> ? U : never };

//
//

export function multiSelector<
  E extends OldSignal<any>,
  T extends Readonly<[E, ...E[]]>,
  U,
>(
  from: T,
  getter: (values: SignalValue<E>) => U,
  is: typeof Object.is,
): OldSignal<U> {
  let values: any[];
  let value!: any;
  let unsubscribes: (() => void)[] | undefined;
  let hasValue = false;

  //

  const callbacks = new Set<(value: any) => void>();

  //

  function getValue(): any {
    values = from.map((signal) => signal.value);
    if (!hasValue) {
      hasValue = true;
    }

    return getter(values as any);
  }

  //
  //

  function subscribe(callback: (value: any) => void) {
    if (!hasValue) {
      value = getValue();
    }

    if (!unsubscribes) {
      let firstSubscribe = true;

      unsubscribes = from.map((signal, i) =>
        signal.subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          if (is(signalValue, values[i])) {
            return;
          }

          values[i] = signalValue;
          value = getter(values as any);

          callback(value);
        }),
      );

      firstSubscribe = false;
    }

    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        for (const unsubscribe of unsubscribes!) {
          unsubscribe();
        }
        unsubscribes = undefined;
      }
    };
  }

  //
  //

  return {
    get value() {
      if (callbacks.size === 0 || !hasValue) {
        return getValue();
      }
      return value;
    },
    subscribe,
  };
}
