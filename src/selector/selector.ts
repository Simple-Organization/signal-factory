import type { OldSignal } from '../../tests/old-selectors/OldSignal';
import { MultiSelector, SingleSelector } from '..';

//

/** One or more values from `Signal` stores. */
type SignalValue<T> =
  T extends OldSignal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends OldSignal<infer U> ? U : never };

//

export function selector<T extends OldSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is?: typeof Object.is,
): OldSignal<U>;

//

export function selector<T>(
  getter: (get: <U>(signal: OldSignal<U>) => U) => T,
  is?: typeof Object.is,
): OldSignal<T>;

//
//

export function selector(
  arg1: OldSignal<any> | ((get: <U>(signal: OldSignal<U>) => U) => any),
  arg2?: ((value: any) => any) | typeof Object.is,
  arg3?: typeof Object.is,
): OldSignal<any> {
  if (typeof arg1 === 'function') {
    return new MultiSelector(arg1, arg2 as typeof Object.is);
  }

  return new SingleSelector(arg1, arg2 as (value: any) => any, arg3);
}
