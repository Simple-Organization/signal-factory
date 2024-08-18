import test, { expect } from '@playwright/test';
import { signal as vueSignal } from '../src/wrappers/vue';
import { signal as solidSignal } from '../src/wrappers/solid';
import { signalWrapper as angularSignal } from '../src/wrappers/angular';
import { selector } from '../src/wrappers/vanilla-atom';

//
//

const wrappers = [
  { name: '@vue', atom: vueSignal },
  { name: '@solid', atom: solidSignal },
  { name: '@angular', atom: angularSignal },
];

//
//

wrappers.forEach(({ name, atom }) => {
  //
  //

  test(name + ' must get subscribed values', async () => {
    const signal = atom('hello');

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

  test(name + ' and selector should work together', async () => {
    const signal = atom('hello');
    const _selector = selector(signal, (value) => value + ' world');

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';

    // Wait for the next tick.
    await new Promise((resolve) => setTimeout(resolve, 0));

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello world', 'world world']);
  });

  //
  //

  test(name + ' should not call if value is a function', async () => {
    const notCall1 = () => {
      throw new Error('This should not be called');
    };
    const notCall2 = () => notCall1();

    const signal = atom(notCall1);

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

  test(name + ' must get subscribed values sync', () => {
    test.fail(name === '@vue'); // Only vue watcher is async.

    const signal = atom('hello');

    const values: string[] = [];

    const unsubscribe = signal.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello', 'world']);
  });
});
