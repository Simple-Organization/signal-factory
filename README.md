# signal-factory

**signal-factory** é uma biblioteca que possui somente dois métodos `setSignalFactory` e `signalFactory`

Aqui está o código JavaScript dele compilado:

```js
var signalFactory = () => {
  throw new Error('Signal factory not set');
};
function setSignalFactory(factory) {
  signalFactory = factory;
}
export { setSignalFactory, signalFactory };
```

O **signal-factory** é usado para evitar duplicar esse código entre as [storage-versioning](https://github.com/Simple-Organization/storage-versioning), [glhera-query](https://github.com/Simple-Organization/glhera-query), [glhera-router](https://github.com/Simple-Organization/glhera-router)

O mais importante é entender o conceito por trás do **signal-factory** para evitar duplicar código na maior parte do tempo você pode simplesmente copiar o código do **signal-factory** e usá-lo

**signal-factory** faz parte da **stack do glhera**

## Configurando reatividade (signals)

Possui o método `setSignalFactory` para configurar o tipo de signal que será usado pela aplicação, podendo variar entre `Vue`, `Angular`, `SolidJS`, `PreactJS Signals`

### React

React não tem suporte nativo para signals, porém é possível usar [@preact/signals-react](https://www.npmjs.com/package/@preact/signals-react) e usar igual ao [Preact](#preact)

Aí é só usar o código abaixo

```ts
import { signal } from '@preact/signals-react';

setSignalFactory(signal);
```

### Preact

Adicionar para o preact com signals é muito simples, de onde a api foi inspirada

```ts
import { signal } from '@preact/signals';

setSignalFactory(signal);
```

### Vue

Você pode usar o wrapper usando `ref` do `signal-factory`

```ts
import { signal } from 'signal-factory/vue';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
import { ref, watch } from 'vue';

//
setSignalFactory(signal);

//
export function signal<T>(initial: T): Signal<T> {
  const _signal: any = ref(initial);

  _signal.subscribe = (cb: (newVal: any) => void) => {
    cb(_signal.value);
    return watch(_signal, cb);
  };

  return _signal;
}
```

### Svelte e vanilla javascript

Você pode usar o wrapper `vanilla` do `signal-factory`

```ts
import { signal } from 'signal-factory/vanilla';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
setSignalFactory(signal);

//

export function signal<T>(initial: T) {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  const subscribe = (callback: (value: T) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
  };
}
```

### Solid

Você pode usar o wrapper `solid` do `signal-factory`

```ts
import { signal } from 'signal-factory/solid';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
import { createEffect, createRoot, createSignal } from 'solid-js';

//
setSignalFactory(signal);

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
```

### Angular signals

Você não pode usar com angular signals porque não é possível se subscrever a um signal como nos outros frameworks, para se inscrever precisa do `effect` que precisa do [`injector`](https://angular.dev/guide/signals#injection-context), como `setSignalFactory` não pode acessar o `injector` acaba não sendo possível usar **Angular Signals**
