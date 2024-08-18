import { test, expect } from '@playwright/test';
import { atom, selector } from '../src/wrappers/vanilla-atom';

//
//

test.describe('Vanilla atom', () => {
  //
  //

  test('Vanilla atom factory', () => {
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

  //
  //

  test('If the same value is given to vanilla atom factory, it must not reupdate', () => {
    const signal = atom('hello');

    const values: string[] = [];

    const unsubscribe = signal.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';
    signal.value = 'world';
    signal.value = 'world';

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello', 'world']);
  });

  //
  //

  test('Vanilla atom should reupdate if is return false', () => {
    const signal = atom('hello', () => false);

    const values: string[] = [];

    const unsubscribe = signal.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';
    signal.value = 'world';
    signal.value = 'world';

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello', 'world', 'world', 'world']);
  });
});

//
//

test.describe('Vanilla single selector', () => {
  //
  //

  test('Vanilla single selector', () => {
    const signal = atom('hello');
    const _selector = selector(signal, (value1) => value1 + '2');

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello2', 'world2']);
  });

  //
  //

  test('If the atom have its value updated, but no one as subscribed to the single selector, it must keep sync', () => {
    const signal = atom('hello');
    const _selector = selector(signal, (value1) => value1 + '2');

    expect(_selector.value).toBe('hello2');

    signal.value = 'world';

    expect(_selector.value).toBe('world2');
  });

  //
  //

  test('If the same value is given to vanilla single selector factory, it must not reupdate', () => {
    const signal = atom('hello');
    const _selector = selector(signal, (value) => value + 1);

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';
    signal.value = 'world';
    signal.value = 'world';

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello1', 'world1']);
  });

  //
  //

  test('If Vanilla atom reupdate the single selector should not reupdate', () => {
    const signal = atom('hello', () => false);
    const _selector = selector(signal, (value) => value + 1);

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.value = 'world';
    signal.value = 'world';
    signal.value = 'world';

    unsubscribe();

    signal.value = 'unsubscribed';

    expect(values).toEqual(['hello1', 'world1']);
  });
});

//
//

test.describe('Vanilla multi selector', () => {
  //
  //

  test('Vanilla multi selector', () => {
    const signal1 = atom('hello');
    const signal2 = atom(2);
    const _selector = selector(
      [signal1, signal2],
      ([value1, value2]) => value1 + value2,
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.value = 'world';
    signal2.value = 3;

    unsubscribe();

    signal1.value = 'unsubscribed';

    expect(values).toEqual(['hello2', 'world2', 'world3']);
  });

  //
  //

  test('If the atom have its value updated, but no one as subscribed to the multi selector, it must keep sync', () => {
    const signal1 = atom('hello');
    const signal2 = atom(2);
    const _selector = selector(
      [signal1, signal2],
      ([value1, value2]) => value1 + value2,
    );

    expect(_selector.value).toBe('hello2');

    signal1.value = 'world';

    expect(_selector.value).toBe('world2');
  });

  //
  //

  test('If the same value is given to vanilla multi selector factory, it must not reupdate', () => {
    const signal1 = atom('hello');
    const signal2 = atom(2);
    const _selector = selector(
      [signal1, signal2],
      ([value1, value2]) => value1 + value2,
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.value = 'world';
    signal1.value = 'world';
    signal1.value = 'world';
    signal2.value = 3;
    signal2.value = 3;
    signal2.value = 3;

    unsubscribe();

    signal1.value = 'unsubscribed';

    expect(values).toEqual(['hello2', 'world2', 'world3']);
  });

  //
  //

  test('If Vanilla atom reupdate the multi selector should not reupdate', () => {
    const signal1 = atom('hello', () => false);
    const signal2 = atom(2, () => false);
    const _selector = selector(
      [signal1, signal2],
      ([value1, value2]) => value1 + value2,
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.value = 'world';
    signal1.value = 'world';
    signal1.value = 'world';
    signal2.value = 3;
    signal2.value = 3;
    signal2.value = 3;

    unsubscribe();

    signal1.value = 'unsubscribed';

    expect(values).toEqual(['hello2', 'world2', 'world3']);
  });
});
