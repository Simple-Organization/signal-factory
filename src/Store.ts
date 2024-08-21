import { ReadableSignal, WritableSignal } from '.';
import { SignalValue, SingleSelector } from './SingleSelector';
import { _is } from './utils';

//
//

export class Store<T> implements WritableSignal<T> {
  #cbs: Set<(value: T) => void> = new Set();
  #value: T;
  #is: (a: T, b: T) => boolean;

  constructor(initial: T, is = _is) {
    this.#value = initial;
    this.#is = is;
  }

  subscribe = (callback: (value: T) => void) => {
    callback(this.#value);
    this.#cbs.add(callback);
    return () => {
      this.#cbs.delete(callback);
    };
  };

  get = () => {
    return this.#value;
  };

  set = (newValue: T) => {
    if (this.#is(this.#value, newValue)) {
      return;
    }

    this.#value = newValue;
    for (const callback of this.#cbs) {
      callback(this.#value);
    }
  };

  selector<T extends ReadableSignal<any>, U>(
    from: T,
    getter: (value: SignalValue<T>) => U,
    is: typeof Object.is = _is,
  ): SingleSelector<T, U> {
    return new SingleSelector(from, getter, is);
  }

  get count() {
    return this.#cbs.size;
  }
}

//
//

export function store<T>(initial: T, is = _is): WritableSignal<T> {
  return new Store(initial, is);
}
