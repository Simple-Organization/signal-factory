import type { WritableSignal } from 'signal-factory';
import { _is, Comparator } from './utils';

//
//

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

  constructor(initial: T, is: Comparator = _is) {
    this._value = initial;
    this._is = is;
  }

  get() {
    return this._value;
  }

  subscribe(callback: (value: T) => void) {
    callback(this._value);
    this._cbs.add(callback);
    return () => {
      this._cbs.delete(callback);
    };
  }

  set(newValue: T) {
    if (this._is(this._value, newValue)) {
      return;
    }

    this._value = newValue;
    for (const callback of this._cbs) {
      callback(this._value);
    }
  }
}

//
//

export function store<T>(initial: T, is: Comparator = _is): Store<T> {
  return new Store(initial, is);
}
