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

export function selector<E, T extends Readonly<[...Signal<E>[]]>, U>(
  from: T,
  getter: (values: E[]) => U,
): Signal<U> {
  const callbacks = new Set<(value: U) => void>();

  //
  //

  let values = from.map((signal) => signal.value);
  let value = getter(values);

  //
  //

  const subscribe = (callback: (value: U) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
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
