import { test, expect } from '@playwright/test';
import { Atom, selector } from '../src/wrappers/vanilla-class-atom';

//
//

test('Vanilla class atom factory', () => {
  const signal = new Atom('hello');

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

test('If the same value is given to vanilla class atom factory, it must not recall', () => {
  const signal = new Atom('hello');

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

test('Vanilla class multi selector', () => {
  const signal1 = new Atom('hello');
  const signal2 = new Atom(2);
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

test('Vanilla class single selector', () => {
  const signal = new Atom('hello');
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

test('If the same value is given to vanilla class multi selector factory, it must not recall', () => {
  const signal1 = new Atom('hello');
  const signal2 = new Atom(2);
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

test('If the atom have its value updated, but no one as subscribed to the single selector, it must keep sync', () => {
  const signal = new Atom('hello');
  const _selector = selector(signal, (value1) => value1 + '2');

  expect(_selector.value).toBe('hello2');

  signal.value = 'world';

  expect(_selector.value).toBe('world2');
});

//
//

test('Vanilla class selector single from', () => {
  const signal = new Atom('hello');
  const _selector = selector(signal, (value) => value + 1);

  const values: string[] = [];

  const unsubscribe = _selector.subscribe((value) => {
    values.push(value);
  });

  signal.value = 'world';

  unsubscribe();

  signal.value = 'unsubscribed';

  expect(values).toEqual(['hello1', 'world1']);
});
