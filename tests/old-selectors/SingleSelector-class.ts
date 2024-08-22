import type { OldSignal } from './OldSignal';
import { _is } from '../../src/stores/utils';

//
//

export class SingleSelector<T> implements OldSignal<T> {
  /** @internal */
  protected _v!: T;
  /** @internal */
  protected _cbs = new Set<(value: T) => void>();
  /** @internal */
  protected _unsub: (() => void) | undefined;
  /** @internal */
  protected _from: OldSignal<any>;
  /** @internal */
  protected _getter: (value: T) => T;
  /** @internal */
  protected _hasValue = false;

  constructor(
    from: OldSignal<T>,
    getter: (value: T) => T,
    readonly is: typeof Object.is = _is,
  ) {
    this._from = from;
    this._getter = getter;
  }

  get value() {
    if (this._cbs.size === 0) {
      return this._getter(this._from.value);
    } else if (!this._hasValue) {
      this._v = this._getter(this._from.value);
      this._hasValue = true;
    }
    return this._v;
  }

  subscribe(callback: (value: T) => void) {
    if (!this._hasValue) {
      this._v = this._getter(this._from.value);
      this._hasValue = true;
    }

    if (!this._unsub) {
      let firstSubscribe = true;

      this._unsub = this._from.subscribe((fromValue) => {
        if (firstSubscribe) {
          return;
        }

        const newValue = this._getter(fromValue);

        if (this.is(newValue, this._v)) {
          return;
        }

        this._v = newValue;

        callback(newValue);
      });

      firstSubscribe = false;
    }

    callback(this._v);
    this._cbs.add(callback);
    return () => {
      this._cbs.delete(callback);

      if (this._cbs.size === 0) {
        this._unsub!();
        this._unsub = undefined;
      }
    };
  }

  get count() {
    return this._cbs.size;
  }
}
