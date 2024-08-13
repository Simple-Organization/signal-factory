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

### Preact

```ts
//
// Preact Signals: mais simples de todos, de onde a api foi inspirada
setSignalFactory(signal);
```

### Vue

```ts
//
// Vue: adiciona o método subscribe ao ref criado com watch
setSignalFactory((initial) => {
  const signal = ref(initial);

  signal.subscribe = (cb: (newVal) => void) => {
    cb(signal.value);
    return watch(signal, cb);
  };

  return signal;
});
```

### Svelte e vanilla javascript

Você pode usar o `signal-factory/vanilla` ou simplesmente copiar o código abaixo que é o mesmo do `signal-factory/vanilla`

```ts
setSignalFactory(signal);

//
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

```ts
//
// Solid: cria um wrapper com createRoot e createEffect
setSignalFactory((initial) => {
  const [value, setValue] = createSignal(initial);

  return {
    get value() {
      return value();
    },
    set value(newValue) {
      setValue(newValue);
    },

    subscribe(callback: (value) => void) {
      let dispose;
      createRoot((disposer) => {
        dispose = disposer;
        createEffect(() => callback(value()));
      });
      return dispose;
    },
  };
});
```

### Angular signals

Você não pode usar com angular signals porque não é possível se subscrever a um signal como nos outros frameworks, para se inscrever precisa do `effect` que precisa do [`injector`](https://angular.dev/guide/signals#injection-context), como `setSignalFactory` não pode acessar o `injector` acaba não sendo possível usar **Angular Signals**
