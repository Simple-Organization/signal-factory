import { Signal } from '..';

//
//

export class Atom<T> implements Signal<T> {
  /** @internal */
  protected _v: T;
  /** @internal */
  protected _cbs = new Set<(value: T) => void>();

  constructor(
    initial: T,
    readonly is: typeof Object.is = Object.is,
  ) {
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
}

//
//

export class SingleSelector<T> implements Signal<T> {
  /** @internal */
  protected _v!: T;
  /** @internal */
  protected _cbs = new Set<(value: T) => void>();
  /** @internal */
  protected _unsub: (() => void) | undefined;
  /** @internal */
  protected _from: Signal<any>;
  /** @internal */
  protected _getter: (value: T) => T;
  /** @internal */
  protected _hasValue = false;

  constructor(
    from: Signal<T>,
    getter: (value: T) => T,
    readonly is: typeof Object.is,
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
}

//
//

export class MultiSelector<T> implements Signal<T> {
  /** @internal */
  protected _v!: T;
  /** @internal */
  protected _cbs = new Set<(value: T) => void>();
  /** @internal */
  protected _unsubs: (() => void)[] | undefined;
  /** @internal */
  protected _from: Signal<any>[];
  /** @internal */
  protected _getter: (value: any[]) => T;
  /** @internal */
  protected values!: any[];
  /** @internal */
  protected _hasValue = false;

  constructor(
    from: Signal<any>[],
    getter: (values: any[]) => T,
    readonly is: typeof Object.is,
  ) {
    this._from = from;
    this._getter = getter;
  }

  get value() {
    if (this._cbs.size === 0 || !this._hasValue) {
      return this._getValue();
    }
    return this._v;
  }

  /** @internal */
  private _getValue(): any {
    if (!this._hasValue) {
      this._hasValue = true;
    }

    this.values = this._from.map((signal) => signal.value);
    return this._getter(this.values as any);
  }

  subscribe(callback: (value: T) => void) {
    if (!this._hasValue) {
      this._v = this._getValue();
    }

    if (!this._unsubs) {
      let firstSubscribe = true;

      this._unsubs = this._from.map((signal, i) =>
        signal.subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          if (this.is(signalValue, this.values[i])) {
            return;
          }

          this.values[i] = signalValue;
          this._v = this._getter(this.values as any);

          callback(this.value);
        }),
      );

      firstSubscribe = false;
    }

    callback(this._v);
    this._cbs.add(callback);
    return () => {
      this._cbs.delete(callback);

      if (this._cbs.size === 0) {
        for (const unsubscribe of this._unsubs!) {
          unsubscribe();
        }
        this._unsubs = undefined;
      }
    };
  }
}

//
//

/** One or more values from `Signal` stores. */
type SignalValue<T> =
  T extends Signal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends Signal<infer U> ? U : never };

//

export function selector<T extends Signal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is?: typeof Object.is,
): Signal<U>;

//

export function selector<
  E extends Signal<any>,
  T extends Readonly<[E, ...E[]]>,
  U,
>(
  from: T,
  getter: (values: SignalValue<E>) => U,
  is?: typeof Object.is,
): Signal<U>;

//
//

export function selector(
  from: Signal<any> | Signal<any>[],
  getter: (values: any) => any,
  is = Object.is,
): Signal<any> {
  return Array.isArray(from)
    ? new MultiSelector(from as any, getter, is)
    : new SingleSelector(from, getter, is);
}
