import type { WritableSignal } from 'signal-factory';
import { _is } from './utils';

//
//

export class Store<T> implements WritableSignal<T> {
  _cbs: Set<(value: T) => void> = new Set();
  _value: T;
  _is: (a: T, b: T) => boolean;

  constructor(initial: T, is = _is) {
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

export function store<T>(initial: T, is = _is): Store<T> {
  return new Store(initial, is);
}
