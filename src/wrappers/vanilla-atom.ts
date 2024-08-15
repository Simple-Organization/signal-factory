import { Signal } from '..';

//
//

export function atom<T>(initial: T): Signal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  const subscribe = (callback: (value: T) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}

//
//

export function selector<E, T extends Signal<E>, U>(
  from: T,
  getter: (value: E) => U,
): Signal<U>;

export function selector<E, T extends Readonly<[...Signal<E>[]]>, U>(
  from: T,
  getter: (values: E[]) => U,
): Signal<U>;

//
//

export function selector(
  from: Signal<any> | Signal<any>[],
  getter: (values: any) => any,
): Signal<any> {
  const callbacks = new Set<(value: any) => void>();

  //
  //

  const isArray = Array.isArray(from);

  function getValue(): any {
    if (isArray) {
      values = (from as Signal<any>[]).map((signal) => signal.value);
      return getter(values);
    } else {
      return getter((from as Signal<any>).value);
    }
  }

  //
  //

  let values: any[];
  let value = getValue();
  let unsubscribes: (() => void)[] | (() => void) | undefined;

  //
  //

  const subscribe = (callback: (value: any) => void) => {
    if (!unsubscribes) {
      let firstSubscribe = true;

      if (isArray) {
        unsubscribes = (from as Signal<any>[]).map((signal, i) =>
          signal.subscribe((value) => {
            values[i] = value;
            value = getter(values);
            if (!firstSubscribe) {
              callback(value);
            }
          }),
        );
      } else {
        unsubscribes = (from as Signal<any>).subscribe((value) => {
          value = getter(value);
          if (!firstSubscribe) {
            callback(value);
          }
        });
      }

      firstSubscribe = false;
    }

    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        if (isArray) {
          for (const unsubscribe of unsubscribes as (() => void)[]) {
            unsubscribe();
          }
        } else {
          (unsubscribes as () => void)();
        }
        unsubscribes = undefined;
      }
    };
  };

  //
  //

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}
