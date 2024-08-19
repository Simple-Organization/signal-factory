import { Atom } from '../tests/old-selectors/class-atom';

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
  count?: number;
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

/**
 * Sets the signalFactory.
 * @param factory - Function that creates a signal with an initial value.
 */
export function setSignalFactory(
  factory: (initial: any) => WritableSignal,
): void {
  signalFactory = factory;
}

/**
 * A function that creates a explicit signal
 * @param initial - The initial value of the signal.
 * @returns A signal with the specified initial value.
 * @throws {Error} - If the signal factory is not set.
 */
export let signalFactory: <T>(
  initial: T,
  is?: typeof Object.is,
) => ReadableSignal<T> = atom;

//
//

export function atom<T>(initial: T, is?: typeof Object.is): WritableSignal<T> {
  return new Atom(initial, is);
}

export { Atom };
export { selector } from './selector/selector';
export { MultiSelector } from '../tests/old-selectors/MultiSelector-class';
export { SingleSelector } from '../tests/old-selectors/SingleSelector-class';
