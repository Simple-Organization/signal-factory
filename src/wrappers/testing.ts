import { Signal } from '..';

/**
 * Wrapper for a signal/atom that adds additional properties for testing.
 */
export interface TestSignal<T = any> extends Signal<T> {
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

export function testWrapper<T>(signal: Signal<T>): TestSignal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = signal.value;
  let history: T[] = [value];

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
      value = newValue;
      history = [...history, newValue];
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
    get count() {
      return callbacks.size;
    },
    get history() {
      return history;
    },
  };
}
