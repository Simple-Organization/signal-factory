import type { OldSignal } from '../../tests/old-selectors/OldSignal';
import { _is } from '../utils';

//
//

/** One value from a `Signal`. */
type SignalValue<T> = T extends OldSignal<infer U> ? U : never;

//
//

export function singleSelector<T extends OldSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: typeof Object.is = _is,
): OldSignal<U> {
  let value!: any;
  let unsubscribe: (() => void) | undefined;
  let hasValue = false;

  //

  const callbacks = new Set<(value: any) => void>();

  //
  //

  function subscribe(callback: (value: any) => void) {
    if (!hasValue) {
      value = getter(from.value);
      hasValue = true;
    }

    if (!unsubscribe) {
      let firstSubscribe = true;

      unsubscribe = from.subscribe((fromValue) => {
        if (firstSubscribe) {
          return;
        }

        const newValue = getter(fromValue);

        if (is(newValue, value)) {
          return;
        }

        value = newValue;
        callback(value);
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
      } else if (!hasValue) {
        value = getter(from.value);
        hasValue = true;
      }
      return value;
    },
    subscribe,
    get count() {
      return callbacks.size;
    },
  };
}
