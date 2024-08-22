import { Store } from '../../src/stores';
import { atom } from '../experiments/atom';

//
//

let type: 'atom' | 'Store' | 'AtomClass';

type = 'Store' as any;

let bigArray = new Array(1000000).fill(0);

//
//

if (type === 'Store') {
  const store = new Store(0);

  console.log(store);

  store.subscribe((count) => {
    console.log('count:', count);
  });

  store.set(1);
  store.set(2);
  store.set(3);

  bigArray.fill(new Store(0));
}

//
//

if (type === 'atom') {
  const store = atom(0);

  store.subscribe((count) => {
    console.log('count:', count);
  });

  store.set(1);
  store.set(2);
  store.set(3);

  bigArray.fill(atom(0));
}

console.log(bigArray);
