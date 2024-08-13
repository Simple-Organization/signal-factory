import { test, expect } from '@playwright/test';
import { setSignalFactory, signalFactory } from '../src';
import { signal as vanillaSignal } from '../src/wrappers/vanilla';
import { signal as vueSignal } from '../src/wrappers/vue';
import { signal as solidSignal } from '../src/wrappers/solid';

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

//
//

test('vue signal factory', async () => {
  const signal = vueSignal('hello');

  const values: string[] = [];

  const unsubscribe = signal.subscribe((value) => {
    values.push(value);
  });

  signal.value = 'world';

  // Wait for the next tick.
  await new Promise((resolve) => setTimeout(resolve, 0));

  unsubscribe();

  signal.value = 'unsubscribed';

  expect(values).toEqual(['hello', 'world']);
});

//
//

test('vue signal factory should not call if value is a function', async () => {
  const notCall1 = () => {
    throw new Error('This should not be called');
  };
  const notCall2 = () => notCall1();

  const signal = vueSignal(notCall1);

  const values: (() => void)[] = [];

  signal.subscribe((value) => {
    values.push(value);
  });

  signal.value = notCall2;

  // Wait for the next tick.
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(values).toEqual([notCall1, notCall2]);
});

//
//

test('solid signal factory', async () => {
  const signal = solidSignal('hello');

  const values: string[] = [];

  const unsubscribe = signal.subscribe((value) => {
    values.push(value);
  });

  signal.value = 'world';

  unsubscribe();

  signal.value = 'unsubscribed';

  expect(values).toEqual(['hello', 'world']);
});


//
//

test('solid signal factory should not call if value is a function', async () => {
  const notCall1 = () => {
    throw new Error('This should not be called');
  };
  const notCall2 = () => notCall1();

  const signal = solidSignal(notCall1);

  const values: (() => void)[] = [];

  signal.subscribe((value) => {
    values.push(value);
  });

  signal.value = notCall2;

  // Wait for the next tick.
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(values).toEqual([notCall1, notCall2]);
});