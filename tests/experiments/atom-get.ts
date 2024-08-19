import type { WritableSignal } from '../../src';
import { _is } from '../../src/utils';

//
//

export function atom2<T>(initial: T): WritableSignal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  function subscribe(callback: (value: T) => void) {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  }

  function get() {
    return value;
  }

  function set(newValue: T) {
    if (Object.is(value, newValue)) {
      return;
    }

    value = newValue;
    for (const callback of callbacks) {
      callback(value);
    }
  }

  return {
    get,
    set,
    subscribe,
  };
}
