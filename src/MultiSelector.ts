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
  #cbs: Set<(value: T) => void> = new Set();
  #unsubs: (() => void)[] | undefined;
  #hasValue = false;

  //
  //

  constructor(
    getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
    is: typeof Object.is = _is,
  ) {
    this.#getter = getter;
    this.#is = is;
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

    const values = [];

    for (const signal of this.#from!) {
      values.push(signal.get());
    }

    this.#values = values;
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

    //
    //

    if (!this.#unsubs) {
      let firstSubscribe = true;
      this.#unsubs = [];

      for (let i = 0; i < this.#from!.length; i++) {
        const unsub = this.#from![i].subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          if (this.#is(this.#values![i], signalValue)) {
            return;
          }

          this.#values![i] = signalValue;
          const value = this.#getter((signal) => signal.get());
          this.#value = value;

          for (const cb of this.#cbs) {
            cb(value);
          }
        });

        this.#unsubs.push(unsub);
      }

      firstSubscribe = false;
    }

    //
    //

    this.#cbs.add(callback);
    callback(this.#value);

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
    } else if (this.#cbs.size === 0) {
      return this.#getValue();
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
