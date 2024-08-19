import { Signal } from '../../src';
import { SingleSelector } from '../../src/selector/SingleSelector-class';

//
//

//

export function oldSelector<T extends Signal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is?: typeof Object.is,
): Signal<U>;

//

export function oldSelector<
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

export function oldSelector(
  from: Signal<any> | Signal<any>[],
  getter: (values: any) => any,
  is = Object.is,
): Signal<any> {
  return Array.isArray(from)
    ? new MultiSelector(from as any, getter, is)
    : new SingleSelector(from, getter, is);
}

//
//

/** One or more values from `Signal` stores. */
export type SignalValue<T> =
  T extends Signal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends Signal<infer U> ? U : never };

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
