import { ReadableSignal } from '.';
import { _is } from './utils';

//
//

export class MultiSelector<T> implements ReadableSignal<T> {
  #getter: (get: <U>(signal: ReadableSignal<U>) => U) => T;
  #is: typeof Object.is;
  #from: ReadableSignal<any>[] | undefined;
  #values: any[] | undefined;
  #value: any;
  #cbs: Set<(value: T) => void>;
  #unsubs: (() => void)[] | undefined;
  #hasValue: boolean;

  //
  //

  constructor(
    getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
    is: typeof Object.is = _is,
  ) {
    this.#getter = getter;
    this.#is = is;
    this.#cbs = new Set();
    this.#hasValue = false;
  }

  //
  //

  #getValue(): any {
    this.#values = [];

    for (const signal of this.#from!) {
      this.#values.push(signal.get());
    }

    this.#value = this.#getter((signal) => signal.get());
    return this.#value;
  }

  //
  //

  #firstGet(): any {
    this.#from = [];

    const getMethod = (signal: ReadableSignal<any>) => {
      if (!this.#from!.includes(signal)) {
        this.#from!.push(signal);
      }
      return signal.get();
    };

    this.#value = this.#getter(getMethod);
    this.#hasValue = true;

    return this.#value;
  }

  //
  //

  subscribe(callback: (value: T) => void) {
    if (!this.#hasValue) {
      this.#firstGet();
    }

    this.#cbs.add(callback);
    callback(this.#value);

    if (!this.#unsubs) {
      this.#unsubs = this.#from!.map((signal) =>
        signal.subscribe(() => {
          const newValue = this.#getValue();
          if (!this.#is(newValue, this.#value)) {
            this.#value = newValue;
            for (const cb of this.#cbs) {
              cb(this.#value);
            }
          }
        }),
      );
    }

    //
    //

    return () => {
      this.#cbs.delete(callback);
      if (this.#cbs.size === 0 && this.#unsubs) {
        for (const unsubscribe of this.#unsubs) {
          unsubscribe();
        }
        this.#unsubs = undefined;
      }
    };
  }

  //
  //

  get() {
    if (!this.#hasValue) {
      this.#firstGet();
    }
    return this.#value;
  }

  //
  //

  count() {
    return this.#cbs.size;
  }
}

//
//

export function multiSelector<T>(
  getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
  is: typeof Object.is = _is,
): MultiSelector<T> {
  return new MultiSelector(getter, is);
}
