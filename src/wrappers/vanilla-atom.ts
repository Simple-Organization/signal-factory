import { Signal } from '..';

//
//

export function atom<T>(initial: T, is = Object.is): Signal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  const subscribe = (callback: (value: T) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      if (is(value, newValue)) {
        return;
      }

      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}

//
//

/** One or more values from `Signal` stores. */
type SignalValue<T> =
  T extends Signal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends Signal<infer U> ? U : never };

//

export function selector<T extends Signal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is?: typeof Object.is,
): Signal<U>;

//

export function selector<
  E extends Signal<any>,
  T extends Readonly<[E, ...E[]]>,
  U,
>(
  from: T,
  getter: (values: SignalValue<E>) => U,
  is?: typeof Object.is,
): Signal<U>;

//
//

export function selector(
  from: Signal<any> | Signal<any>[],
  getter: (values: any) => any,
  is = Object.is,
): Signal<any> {
  return Array.isArray(from)
    ? multiSelector(from as any, getter, is)
    : singleSelector(from, getter, is);
}

//
//

function singleSelector<T extends Signal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: typeof Object.is,
): Signal<U> {
  let value = getter(from.value);
  let unsubscribe: (() => void) | undefined;

  //

  const callbacks = new Set<(value: any) => void>();

  //
  //

  function subscribe(callback: (value: any) => void) {
    if (!unsubscribe) {
      let firstSubscribe = true;

      unsubscribe = from.subscribe((fromValue) => {
        const newValue = getter(fromValue);

        if (is(newValue, value)) {
          return;
        }

        value = newValue;

        if (!firstSubscribe) {
          callback(value);
        }
      });

      firstSubscribe = false;
    }

    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        unsubscribe!();
        unsubscribe = undefined;
      }
    };
  }

  //
  //

  return {
    get value() {
      if (callbacks.size === 0) {
        return getter(from.value);
      }
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}

//
//

function multiSelector<
  E extends Signal<any>,
  T extends Readonly<[E, ...E[]]>,
  U,
>(
  from: T,
  getter: (values: SignalValue<E>) => U,
  is: typeof Object.is,
): Signal<U> {
  let values: any[];
  let value = getValue();
  let unsubscribes: (() => void)[] | undefined;

  //

  const callbacks = new Set<(value: any) => void>();

  //

  function getValue(): any {
    values = from.map((signal) => signal.value);
    return getter(values as any);
  }

  //
  //

  function subscribe(callback: (value: any) => void) {
    if (!unsubscribes) {
      let firstSubscribe = true;

      unsubscribes = from.map((signal, i) =>
        signal.subscribe((signalValue) => {
          if (firstSubscribe) {
            values[i] = signalValue;
            value = getter(values as any);
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
      if (callbacks.size === 0) {
        return getValue();
      }
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}
