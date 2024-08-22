import { ReadableSignal } from '../../src';
import { _is } from '../../src/stores/utils';
import { atom } from './atom';

//
//

export function selector<T>(
  getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
  is = _is,
): ReadableSignal<T> {
  let from: ReadableSignal<any>[] | undefined;
  let values: any[] | undefined;

  const internal = atom<T>(undefined as any, is);

  let unsubscribes: (() => void)[] | undefined;
  let numSubscribers = 0;
  let hasValue = false;

  //
  //

  function getValue(): any {
    values = [];

    for (const signal of from!) {
      values.push(signal.get());
    }

    internal.set(getter((signal) => signal.get()));
    return internal.get();
  }

  //
  //

  function firstGet(): any {
    from = [];

    const getMethod = (signal: ReadableSignal<any>) => {
      if (!from!.includes(signal)) {
        from!.push(signal);
      }
      return signal.get();
    };

    values = [];

    for (const signal of from!) {
      values.push(signal.get());
    }

    internal.set(getter(getMethod));

    hasValue = true;
  }

  //
  //

  function subscribe(callback: (value: any) => void) {
    if (!hasValue) {
      firstGet();
    }

    if (!unsubscribes) {
      let firstSubscribe = true;
      unsubscribes = [];

      for (let i = 0; i < from!.length; i++) {
        const unsub = from![i].subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          values![i] = signalValue;
          internal.set(getter((signal) => signal.get()));
        });

        unsubscribes.push(unsub);
      }

      firstSubscribe = false;
    }

    //
    //

    const unsub = internal.subscribe(callback);

    numSubscribers++;

    //
    //

    return () => {
      unsub();
      numSubscribers--;

      if (numSubscribers === 0) {
        for (const unsubscribe of unsubscribes!) {
          unsubscribe();
          unsubscribes = undefined;
        }
      }
    };
  }

  //
  //

  function get() {
    if (!hasValue) {
      firstGet();
    } else if (numSubscribers === 0) {
      return getValue();
    }
    return internal.get();
  }

  //
  //

  function count() {
    return numSubscribers;
  }

  //
  //

  return {
    get,
    subscribe,
    count,
  };
}
