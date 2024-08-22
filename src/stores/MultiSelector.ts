import type { ReadableSignal } from 'signal-factory';
import { _is } from './utils';

//
//

export class MultiSelector<T> implements ReadableSignal<T> {
  _getter: (get: <U>(signal: ReadableSignal<U>) => U) => T;
  _is: typeof Object.is;
  _from: ReadableSignal<any>[] | undefined;
  _values: any[] | undefined;
  _value: any;
  _cbs: Set<(value: T) => void> = new Set();
  _unsubs: (() => void)[] | undefined;
  _hasValue = false;

  //
  //

  constructor(
    getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
    is: typeof Object.is = _is,
  ) {
    this._getter = getter;
    this._is = is;
  }

  //
  //

  get() {
    if (!this._hasValue) {
      this._firstGet();
    } else if (this._cbs.size === 0) {
      return this._getValue();
    }
    return this._value;
  }

  //
  //

  _getValue(): any {
    this._values = [];

    for (const signal of this._from!) {
      this._values.push(signal.get());
    }

    this._value = this._getter((signal) => signal.get());
    return this._value;
  }

  //
  //

  _firstGet(): any {
    this._from = [];

    const getMethod = (signal: ReadableSignal<any>) => {
      if (!this._from!.includes(signal)) {
        this._from!.push(signal);
      }
      return signal.get();
    };

    const values = [];

    for (const signal of this._from!) {
      values.push(signal.get());
    }

    this._values = values;
    this._value = this._getter(getMethod);
    this._hasValue = true;

    return this._value;
  }

  //
  //

  subscribe(callback: (value: T) => void) {
    if (!this._hasValue) {
      this._firstGet();
    }

    //
    //

    if (!this._unsubs) {
      let firstSubscribe = true;
      this._unsubs = [];

      for (let i = 0; i < this._from!.length; i++) {
        const unsub = this._from![i].subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          if (this._is(this._values![i], signalValue)) {
            return;
          }

          this._values![i] = signalValue;
          const value = this._getter((signal) => signal.get());
          this._value = value;

          for (const cb of this._cbs) {
            cb(value);
          }
        });

        this._unsubs.push(unsub);
      }

      firstSubscribe = false;
    }

    //
    //

    this._cbs.add(callback);
    callback(this._value);

    //
    //

    return () => {
      this._cbs.delete(callback);
      if (this._cbs.size === 0 && this._unsubs) {
        for (const unsubscribe of this._unsubs) {
          unsubscribe();
        }
        this._unsubs = undefined;
      }
    };
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
