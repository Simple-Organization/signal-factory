import { Signal } from '..';
import { type Ref, ref, watch } from 'vue';

//
//

export function signal<T>(initial: T): Signal<T> {
  const _signal: any = ref(initial);

  //
  // We use "this" to save memory by not creating a new function for each signal created
  function subscribe<T>(
    this: Ref<T>,
    callback: (value: T) => void,
  ): () => void {
    callback(this.value);
    return watch(this, callback);
  }

  _signal.subscribe = subscribe;

  return _signal;
}
