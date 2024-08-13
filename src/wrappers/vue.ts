import { Signal } from '..';
import { ref, watch } from 'vue';

//
//

export function signal<T>(initial: T): Signal<T> {
  const _signal: any = ref(initial);

  _signal.subscribe = (cb: (newVal: any) => void) => {
    cb(_signal.value);
    return watch(_signal, cb);
  };

  return _signal;
}
