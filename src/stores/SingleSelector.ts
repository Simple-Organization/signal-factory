import type { ReadableSignal } from 'signal-factory';
import { _is, Comparator } from './utils';

//
//

export type SignalValue<T> = T extends ReadableSignal<infer U> ? U : never;

//
//

export class SingleSelector<T extends ReadableSignal<any>, U>
  implements ReadableSignal<U>
{
  /**
   * @internal
   */
  _value!: any;

  /**
   * @internal
   */
  _from: T;

  /**
   * @internal
   */
  _getter: (value: SignalValue<T>) => U;

  /**
   * @internal
   */
  _unsub: (() => void) | undefined;

  /**
   * @internal
   */
  _hasValue = false;

  /**
   * @internal
   */
  _cbs = new Set<(value: any) => void>();

  /**
   * @internal
   */
  _is: Comparator;

  //
  //

  constructor(
    from: T,
    getter: (value: SignalValue<T>) => U,
    is: Comparator = _is,
  ) {
    this._from = from;
    this._getter = getter;
    this._is = is;
  }

  get() {
    if (!this._unsub) {
      return this._getter(this._from.get());
    }
    return this._value;
  }

  subscribe(callback: (value: any) => void) {
    if (!this._hasValue) {
      this._value = this._getter(this._from.get());
      this._hasValue = true;
    }

    if (!this._unsub) {
      let firstSubscribe = true;

      this._unsub = this._from.subscribe((fromValue) => {
        if (firstSubscribe) {
          firstSubscribe = false;
          return;
        }

        const newValue = this._getter(fromValue);

        if (this._is(newValue, this._value)) {
          return;
        }

        this._value = newValue;
        for (const callback of this._cbs) {
          callback(this._value);
        }
      });
    }

    this._cbs.add(callback);
    callback(this._value);

    return () => {
      this._cbs.delete(callback);
      if (this._cbs.size === 0 && this._unsub) {
        this._unsub();
        this._unsub = undefined;
      }
    };
  }
}

//
//

export function singleSelector<T extends ReadableSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: Comparator = _is,
): ReadableSignal<U> {
  return new SingleSelector(from, getter, is);
}
