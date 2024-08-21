/**
 * Represents a signal/atom that holds a value and allows subscribing to changes.
 */
export type ReadableSignal<T = any> = {
  /**
   * The current value of the signal/atom.
   */
  get: () => T;

  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe: (callback: (value: T) => void) => () => void;

  /**
   * The number of subscribers to the signal/atom for tests.
   *
   * May not be present depending on the signal set with `setSignalFactory`.
   */
  count?: () => number;
};

/**
 * Represents a signal/atom that holds a value and allows subscribing to changes.
 */
export interface WritableSignal<T = any> extends ReadableSignal<T> {
  /**
   * Sets the value of the signal/atom.
   */
  set: (value: T) => void;
}

export { store, Store } from './Store';
export { singleSelector as selector, SingleSelector } from './SingleSelector';
export { multiSelector, MultiSelector } from './MultiSelector';
