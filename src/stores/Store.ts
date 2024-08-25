import type { WritableSignal } from 'signal-factory';
import { _is, Comparator } from './utils';

//
//

/**
 * A signal/atom that holds a value and allows subscribing to changes.
 */
export class Store<T> implements WritableSignal<T> {
  /**
   * @internal
   */
  _value: T;

  /**
   * @internal
   */
  _cbs: Set<(value: T) => void> = new Set();

  /**
   * @internal
   */
  _is: Comparator;

  /**
   * Creates a new store.
   * @param initial The initial value of the store.
   * @param is The function that compares the current value with the new value.
   */
  constructor(initial: T, is: Comparator = _is) {
    this._value = initial;
    this._is = is;
  }

  /**
   * The current value of the signal/atom.
   * @returns The current value of the signal/atom.
   */
  get(): T {
    return this._value;
  }

  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe(callback: (value: T) => void): () => void {
    callback(this._value);
    this._cbs.add(callback);
    return () => {
      this._cbs.delete(callback);
    };
  }

  /**
   * Sets the value of the signal/atom.
   * @param newValue The new value to set.
   */
  set(newValue: T): void {
    if (this._is(this._value, newValue)) {
      return;
    }

    this._value = newValue;
    for (const callback of this._cbs) {
      callback(this._value);
    }
  }

  /**
   * Updates the value of the signal/atom.
   * @param updater The function that updates the current value.
   */
  update(updater: (value: T) => T): void {
    this.set(updater(this._value));
  }
}

//
//

export function store<T>(initial: T, is: Comparator = _is): Store<T> {
  return new Store(initial, is);
}
