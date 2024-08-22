import { WritableSignal } from '../../src';
import { _is } from '../../src/stores/utils';

//
//

export function atom<T>(initial: T, is = _is): WritableSignal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  //
  //

  const subscribe = (callback: (value: T) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  //
  //

  function get() {
    return value;
  }

  //
  //

  function set(newValue: T) {
    if (is(value, newValue)) {
      return;
    }

    value = newValue;
    for (const callback of callbacks) {
      callback(value);
    }
  }

  //
  //

  return {
    get,
    subscribe,
    set,
  };
}
