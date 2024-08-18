import { test, expect } from '@playwright/test';
import { atom, selector } from '../src/wrappers/vanilla-atom';
import {
  Atom,
  selector as classSelector,
} from '../src/wrappers/vanilla-class-atom';
import { multiSelector as multiSelector } from '../src/selector/multiSelector';
import { MultiSelector as MultiClassSelector } from '../src/selector/MultiSelector-class';
import { setSignalFactory } from '../src';

//
//

const atoms = [
  { name: 'vanilla atom', atom, singleSelector: selector, multiSelector },
  {
    name: 'vanilla class atom',
    // @ts-ignore
    atom: ((...args: any[]) => new Atom(...args)) as typeof atom,
    singleSelector: classSelector,
    multiSelector: ((...args: any[]) =>
      // @ts-ignore
      new MultiClassSelector(...args)) as typeof multiSelector,
  },
];

//
//

atoms.forEach(({ name, atom, singleSelector, multiSelector }) => {
  test.describe(name, () => {
    //
    //

    test('atom must be created and unsubscribed normally', () => {
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

    test('If the same value is given to the atom, it must not reupdate', () => {
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

    test('atom should reupdate if is return false', () => {
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

  test.describe(name + ': single selector', () => {
    //
    //

    test('single selector must be created and unsubscribed normally', () => {
      const signal = atom('hello');
      const _selector = singleSelector(signal, (value1) => value1 + '2');

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
      const _selector = singleSelector(signal, (value1) => value1 + '2');

      expect(_selector.value).toBe('hello2');

      signal.value = 'world';

      expect(_selector.value).toBe('world2');
    });

    //
    //

    test('If the same value is given to vanilla single selector factory, it must not reupdate', () => {
      const signal = atom('hello');
      const _selector = singleSelector(signal, (value) => value + 1);

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

    test('If the atom reupdate the single selector should not reupdate', () => {
      const signal = atom('hello', () => false);
      const _selector = singleSelector(signal, (value) => value + 1);

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

    test('The single selector must subscribe lazily', () => {
      const signal = atom('hello');

      let count = 0;

      const _selector = singleSelector(signal, (value) => {
        count++;
        return value + 1;
      });

      expect(count).toBe(0);

      const unsubscribe = _selector.subscribe(() => {});

      expect(count).toBe(1);

      unsubscribe();
    });
  });

  //
  //

  test.describe(name + ': multi selector', () => {
    setSignalFactory(atom);

    //
    //

    test('multi selector must be created and unsubscribed normally', () => {
      const signal1 = atom('hello');
      const signal2 = atom(2);
      const _selector = multiSelector((get) => get(signal1) + get(signal2));

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
      const _selector = multiSelector((get) => get(signal1) + get(signal2));

      expect(_selector.value).toBe('hello2');

      signal1.value = 'world';

      expect(_selector.value).toBe('world2');
    });

    //
    //

    test('If the same value is given to vanilla multi selector factory, it must not reupdate', () => {
      const signal1 = atom('hello');
      const signal2 = atom(2);
      const _selector = multiSelector((get) => get(signal1) + get(signal2));

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
      const _selector = multiSelector((get) => get(signal1) + get(signal2));

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

      const _selector = multiSelector((get) => {
        count++;
        return get(signal1) + get(signal2);
      });

      expect(count).toBe(0);

      const unsubscribe = _selector.subscribe(() => {});

      expect(count).toBe(1);

      unsubscribe();
    });
  });
});
