import type { WritableSignal } from 'signal-factory';
import { createSignal } from 'solid-js';

//
//

export function signal<T>(initial: T): WritableSignal<T> {
  let _value = initial;
  const [value, setValue] = createSignal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  //
  //

  function get() {
    return value();
  }

  //
  //

  function set(newValue: T) {
    _value = newValue;
    if (typeof newValue === 'function') {
      setValue(() => newValue);
    } else {
      setValue<any>(newValue);
    }

    for (const callback of callbacks) {
      callback(newValue);
    }
  }

  return {
    get,
    subscribe,
    set,
  };
}
