/**
 * Represents a signal that holds a value and allows subscribing to changes.
 */
export type Signal<T = any> = {
  value: T;
  subscribe: (callback: (value: T) => void) => () => void;
};

/**
 * A function that creates a signal with an initial value.
 * @param initial - The initial value of the signal.
 * @returns A signal with the specified initial value.
 * @throws {Error} - If the signal factory is not set.
 */
export let signalFactory: <T>(initial: any) => Signal<T> = () => {
  throw new Error('Signal factory not set');
};

/**
 * Sets the signalFactory.
 * @param factory - The function that creates a signal with an initial value.
 */
export function setSignalFactory(factory: (initial: any) => Signal): void {
  signalFactory = factory;
}
