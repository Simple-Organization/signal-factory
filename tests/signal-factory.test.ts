import { test, expect } from '@playwright/test';
import { setSignalFactory, signalFactory } from '../src';
import { signal as vanillaSignal } from '../src/wrappers/vanilla';

//
//

test('Must set the signal', () => {
  const _signalFactory = (initial: string) => {
    const callbacks = new Set<(value: string) => void>();
    let value = initial;

    const subscribe = (callback: (value: string) => void) => {
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
  };

  // Set the signal factory.
  setSignalFactory(_signalFactory);

  // Expect the signal factory to be the same as the one we set.
  expect(signalFactory).toBe(_signalFactory);
});

//
//

test('Vanilla signal factory', () => {
  const signal = vanillaSignal('hello');

  const values: string[] = [];

  const unsubscribe = signal.subscribe((value) => {
    values.push(value);
  });

  signal.value = 'world';

  unsubscribe();

  signal.value = 'unsubscribed';

  expect(values).toEqual(['hello', 'world']);
});