import { ReadableSignal } from '.';
import { _is } from './utils';

//
//

export type SignalValue<T> = T extends ReadableSignal<infer U> ? U : never;

//
//

export class SingleSelector<T extends ReadableSignal<any>, U>
  implements ReadableSignal<U>
{
  #from: T;
  #getter: (value: SignalValue<T>) => U;
  #is: typeof Object.is;
  #value!: any;
  #unsub: (() => void) | undefined;
  #hasValue = false;
  #cbs = new Set<(value: any) => void>();

  //
  //

  constructor(
    from: T,
    getter: (value: SignalValue<T>) => U,
    is: typeof Object.is = _is,
  ) {
    this.#from = from;
    this.#getter = getter;
    this.#is = is;
  }

  subscribe(callback: (value: any) => void) {
    if (!this.#hasValue) {
      this.#value = this.#getter(this.#from.get());
      this.#hasValue = true;
    }

    if (!this.#unsub) {
      let firstSubscribe = true;

      this.#unsub = this.#from.subscribe((fromValue) => {
        if (firstSubscribe) {
          firstSubscribe = false;
          return;
        }

        const newValue = this.#getter(fromValue);

        if (this.#is(newValue, this.#value)) {
          return;
        }

        this.#value = newValue;
        for (const callback of this.#cbs) {
          callback(this.#value);
        }
      });
    }

    this.#cbs.add(callback);
    callback(this.#value);

    return () => {
      this.#cbs.delete(callback);
      if (this.#cbs.size === 0 && this.#unsub) {
        this.#unsub();
        this.#unsub = undefined;
      }
    };
  }

  get() {
    if (!this.#unsub) {
      return this.#getter(this.#from.get());
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

export function singleSelector<T extends ReadableSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: typeof Object.is = _is,
): ReadableSignal<U> {
  return new SingleSelector(from, getter, is);
}
