import type { Signal } from '../../src';
import { _is } from '../../src/utils';

//
//

export function atom<T>(initial: T, is = _is): Signal<T> {
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
    get count() {
      return callbacks.size;
    },
  };
}
