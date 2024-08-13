import { Signal } from '..';
import { createEffect, createRoot, createSignal } from 'solid-js';

//
//

export function signal<T>(initial: T): Signal<T> {
  const [value, setValue] = createSignal<T>(initial);

  return {
    get value() {
      return value();
    },
    set value(newValue) {
      setValue(newValue as any);
    },

    subscribe(callback: (value: any) => void) {
      let dispose: () => void;
      createRoot((disposer) => {
        dispose = disposer;
        createEffect(() => callback(value()));
      });

      // @ts-ignore - The return type is correct.
      return dispose;
    },
  };
}
