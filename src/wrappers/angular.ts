import type { WritableSignal } from '..';
import { signal } from '@angular/core';

//
//

export function signalWrapper<T>(initial: T): WritableSignal<T> {
  const _signal = signal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_signal());
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  //
  //

  function get() {
    return _signal();
  }

  //
  //

  function set(newValue: T) {
    _signal.set(newValue);

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
