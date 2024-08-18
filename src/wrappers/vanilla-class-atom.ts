import { Signal } from '..';

//
//

export class Atom<T> implements Signal<T> {
  protected _v: T;
  protected _cbs = new Set<(value: T) => void>();

  constructor(initial: T) {
    this._v = initial;
  }

  get value() {
    return this._v;
  }

  set value(newValue) {
    if (Object.is(this._v, newValue)) {
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
  protected _v: T;
  protected _cbs = new Set<(value: T) => void>();
  protected _unsub: (() => void) | undefined;

  constructor(
    protected _from: Signal<T>,
    protected _getter: (value: T) => T,
  ) {
    this._v = _getter(_from.value);
  }

  get value() {
    if (this._cbs.size === 0) {
      return this._getter(this._from.value);
    }
    return this._v;
  }

  set value(newValue) {
    this._v = newValue;
    for (const callback of this._cbs) {
      callback(this._v);
    }
  }

  subscribe(callback: (value: T) => void) {
    if (!this._unsub) {
      let firstSubscribe = true;

      this._unsub = this._from.subscribe((value) => {
        this._v = this._getter(value);

        if (!firstSubscribe) {
          callback(this._v);
        }
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
  protected _v: T;
  protected _cbs = new Set<(value: T) => void>();
  protected _unsubs: (() => void)[] | undefined;

  constructor(
    protected _from: Signal<any>[],
    protected _getter: (values: any[]) => T,
  ) {
    this._v = _getter(_from.map((signal) => signal.value));
  }

  get value() {
    return this._v;
  }

  set value(newValue) {
    this._v = newValue;
    for (const callback of this._cbs) {
      callback(this._v);
    }
  }

  subscribe(callback: (value: T) => void) {
    if (!this._unsubs) {
      let firstSubscribe = true;

      this._unsubs = this._from.map((signal, i) =>
        signal.subscribe((value) => {
          this._v = this._getter(this._from.map((signal) => signal.value));

          if (!firstSubscribe) {
            callback(this._v);
          }
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
): Signal<U>;

//

export function selector<
  E extends Signal<any>,
  T extends Readonly<[E, ...E[]]>,
  U,
>(from: T, getter: (values: SignalValue<E>) => U): Signal<U>;

//
//

export function selector(
  from: Signal<any> | Signal<any>[],
  getter: (values: any) => any,
): Signal<any> {
  return Array.isArray(from)
    ? new MultiSelector(from as any, getter)
    : new SingleSelector(from, getter);
}
