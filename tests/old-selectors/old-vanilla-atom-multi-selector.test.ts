import { test, expect } from '@playwright/test';
import { atom } from '../../src/atoms/atom';
import { oldSelector as selector } from './old-vanilla-atom-multi-selector';
import { Atom } from '../../src/atoms/class-atom';
import { oldSelector as classSelector } from './old-vanilla-class-atom-multi-selector';

//
//

const atoms = [
  { name: 'vanilla atom', atom, selector },
  {
    name: 'vanilla class atom',
    // @ts-ignore
    atom: ((...args: any[]) => new Atom(...args)) as typeof atom,
    selector: classSelector,
  },
];

//
//

atoms.forEach(({ name, atom, selector }) => {
  //
  //

  test.describe(name + ': old multi selector', () => {
    //
    //

    test('multi selector must be created and unsubscribed normally', () => {
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

    test('If the atom reupdate the multi selector should not reupdate', () => {
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

    //
    //

    test('The multi selector must subscribe lazily', () => {
      const signal1 = atom('hello');
      const signal2 = atom(2);

      let count = 0;

      const _selector = selector([signal1, signal2], ([value1, value2]) => {
        count++;
        return value1 + value2;
      });

      expect(count).toBe(0);

      const unsubscribe = _selector.subscribe(() => {});

      expect(count).toBe(1);

      unsubscribe();
    });
  });
});
