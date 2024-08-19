import type { OldSignal } from '../../tests/old-selectors/OldSignal';
import { createSignal } from 'solid-js';

//
//

export function signal<T>(initial: T): OldSignal<T> {
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

  return {
    get value() {
      return value();
    },
    set value(newValue) {
      _value = newValue;
      if (typeof newValue === 'function') {
        setValue(() => newValue);
      } else {
        setValue<any>(newValue);
      }

      for (const callback of callbacks) {
        callback(newValue);
      }
    },

    subscribe,
  };
}
