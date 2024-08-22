import type { OldSignal } from './OldSignal';
import { _is } from '../../src/stores/utils';
import { oldSignalFactory } from './oldSignalFactory';

//
//

export function multiSelector<T>(
  getter: (get: <U>(signal: OldSignal<U>) => U) => T,
  is: typeof Object.is = _is,
): OldSignal<T> {
  let from: OldSignal<any>[] | undefined;
  let values: any[] | undefined;

  const internal = oldSignalFactory<T>(undefined as any);

  let unsubscribes: (() => void)[] | undefined;
  let numSubscribers = 0;
  let hasValue = false;

  //
  //

  function getValue(): any {
    values = [];

    for (const signal of from!) {
      values.push(signal.value);
    }

    internal.value = getter((signal) => signal.value);
    return internal.value;
  }

  //
  //

  function firstGet(): any {
    from = [];

    const getMethod = (signal: OldSignal<any>) => {
      if (!from!.includes(signal)) {
        from!.push(signal);
      }
      return signal.value;
    };

    values = [];

    for (const signal of from!) {
      values.push(signal.value);
    }

    internal.value = getter(getMethod);

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
          internal.value = getter((signal) => signal.value);
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
    return internal.value;
  }

  //
  //

  return {
    get value() {
      if (!hasValue) {
        firstGet();
      } else if (numSubscribers === 0) {
        return getValue();
      }
      return internal.value;
    },
    subscribe,
    get count() {
      return numSubscribers;
    },
  };
}
