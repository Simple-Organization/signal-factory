import type { OldSignal } from './OldSignal';
import { atom } from './old-value-atom';

/**
 * Sets the signalFactory.
 * @param factory - Function that creates a signal with an initial value.
 */
export function oldSetSignalFactory(factory: (initial: any) => OldSignal): void {
  oldSignalFactory = factory;
}

/**
 * A function that creates a explicit signal
 * @param initial - The initial value of the signal.
 * @returns A signal with the specified initial value.
 * @throws {Error} - If the signal factory is not set.
 */
export let oldSignalFactory: <T>(
  initial: T,
  is?: typeof Object.is,
) => OldSignal<T> = atom;
