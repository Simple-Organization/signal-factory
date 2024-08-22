import type { WritableSignal } from 'signal-factory';
import { type Ref, ref, watch } from 'vue';

//
//

export function signal<T>(initial: T): WritableSignal<T> {
  const _signal: any = ref(initial);

  //
  //

  function get() {
    return _signal.value;
  }

  //
  //

  function set(newValue: T) {
    _signal.value = newValue;
  }

  //
  // We use "this" to save memory by not creating a new function for each signal created
  function subscribe<T>(
    this: Ref<T>,
    callback: (value: T) => void,
  ): () => void {
    callback(_signal.value);
    return watch(_signal, callback);
  }

  return {
    get,
    subscribe,
    set,
  };
}
