import type { WritableSignal } from '..';

/**
 * Wrapper for a signal/atom that adds additional properties for testing.
 */
export interface TestSignal<T = any> extends WritableSignal<T> {
  /**
   * The current number of listeners subscribed to the signal/atom.
   */
  count: number;
  /**
   * The history of the signal's values.
   */
  history: T[];
}

//
//

export function testWrapper<T>(signal: WritableSignal<T>): TestSignal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = signal.get();
  let history: T[] = [value];

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
    value = newValue;
    history = [...history, newValue];
    for (const callback of callbacks) {
      callback(value);
    }
  }

  return {
    get,
    subscribe,
    set,
    get count() {
      return callbacks.size;
    },
    get history() {
      return history;
    },
  };
}
