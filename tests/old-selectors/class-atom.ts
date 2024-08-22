import type { OldSignal } from './OldSignal';
import { _is } from '../../src/stores/utils';

//
//

export class Atom<T> implements OldSignal<T> {
  /** @internal */
  protected _v: T;
  /** @internal */
  protected _cbs = new Set<(value: T) => void>();

  constructor(
    initial: T,
    public is: typeof Object.is = _is,
  ) {
    this.is = is;
    this._v = initial;
  }

  get value() {
    return this._v;
  }

  set value(newValue) {
    if (this.is(this._v, newValue)) {
      return;
    }

    this._v = newValue;
    for (const callback of this._cbs) {
      callback(this._v);
    }
  }

  subscribe(callback: (value: T) => void) {
    callback(this._v);
    this._cbs.add(callback);
    return () => {
      this._cbs.delete(callback);
    };
  }

  get count() {
    return this._cbs.size;
  }
}
