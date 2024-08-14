import { Signal } from '..';
import { signal } from '@angular/core';

//
//

export function signalWrapper<T>(initial: T): Signal<T> {
  const _signal = signal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_signal());
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return _signal();
    },
    set value(newValue) {
      _signal.set(newValue);

      for (const callback of callbacks) {
        callback(newValue);
      }
    },

    subscribe,
  };
}
