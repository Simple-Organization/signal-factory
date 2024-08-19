import { _is } from '../../src/utils';

//
//

/**
 * Represents a signal/atom that holds a value and allows subscribing to changes.
 */
export type Signal<T = any> = {
  /**
   * The current value of the signal/atom.
   *
   * Depending on the implementation, this value may be mutable.
   */
  get: () => T;
  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe: (callback: (value: T) => void) => () => void;

  set: (value: T) => void;
  /**
   * The number of subscribers to the signal/atom for tests.
   *
   * May not be present depending on the signal set with `setSignalFactory`.
   */
  count?: number;
};

//
//

export function atom2<T>(initial: T): Signal<T> {
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
