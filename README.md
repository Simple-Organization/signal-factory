# signal-factory

**signal-factory** é uma biblioteca framework agnostica usada para criar bibliotecas com `state management` que não precisam definir qual framework elas estão utilizando, ou seja, para criar outras biblitecas agnósticas

Tipagem de um signal

```ts
type ReadableSignal<T = any> = {
  get: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
};

interface WritableSignal<T = any> extends ReadableSignal<T> {
  set: (value: T) => void;
}
```

O **signal-factory** é usado para evitar duplicar esse código entre as [storage-versioning](https://github.com/Simple-Organization/storage-versioning), [glhera-query](https://github.com/Simple-Organization/glhera-query), [glhera-router](https://github.com/Simple-Organization/glhera-router)

O mais importante é entender o conceito por trás do **signal-factory** para evitar duplicar código na maior parte do tempo você pode simplesmente copiar o código do **signal-factory** e usá-lo

**signal-factory** faz parte da **stack do glhera**

## Configurando reatividade (signals)

Possui o método `setSignalFactory` para configurar o tipo de signal que será usado pela aplicação, podendo variar entre `Vue`, `Angular`, `SolidJS`, `PreactJS Signals`

## `signal-factory/store`

A api do `signal-factory` oferece um `selector`

```ts
import { store, selector, multiSelector } from 'signal-factory/store';

const mySignal1 = store(1);
const mySignal2 = store(2);

// Para valores únicos
const singleValue = selector(mySignal1, (value) => value + 1);

// Api conveniente para múltiplos valores
// Inspirada do Recoil e Jotai
const multiValue = multiSelector((get) => get(mySignal1) + get(mySignal2));
```

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

Você pode usar também o hook do `signal-factory/preact` com `signal-factory/store` e ao invés de usar o `@preact/signals` você pode usar o `store` para criar os signals

A vantagem dessa abordagem é que ela é explícita do que store está sendo subscrito comparado `@preact/signals`, e ele também não modifica o `render` interno do preact, podendo salvar performance em algumas circunstancias

```tsx
import { store } from 'signal-factory/store';
import { useSubSignals } from 'signal-factory/preact';

// Já vem pré-definido com esse modo
setSignalFactory(store);

//
// Depois

// Nesse exemplo estamos definindo o counter como global, mas é melhor defini-lo com context
// É mais verboso com context, mas ajuda para testes e SSR, se você não usará testes ou SSR
// sinta-se a vontade de usar como singleton

const counter = store(1);

//

export function Component() {
  useSubSignals(() => [someSignal]);

  return <button onClick={() => counter.value++}>Count {counter.value}</button>;
}
```

### Vue

Você pode usar o wrapper usando `ref` do `signal-factory`

```ts
import { signal } from 'signal-factory/vue';

setSignalFactory(signal);
```

### Svelte e vanilla javascript

Você pode simplesmente usar o `store` que já vem pré-definido no `signal-factory/store`

Ou no caso do Svelte você pode adaptar o `writable`

Lembrando que o `store` que o `signal-factory` é praticamente a mesma coisa que o `writable` do Svelte com excessão de que você tem acesso ao método `.get()`

```ts
import { store } from 'signal-factory/store';

setSignalFactory(store);
```

### Solid

Você pode usar o wrapper `solid` do `signal-factory`

```ts
import { signal } from 'signal-factory/solid';

setSignalFactory(signal);
```

### Angular signals

Você pode usar o wrapper `angular` do `signal-factory`

```ts
import { signal } from 'signal-factory/angular';

setSignalFactory(signal);
```

## Testing

A api prove um `wrapper` para poder vizualizar o número de subscrições e o histórico de valores de um signal/store

```ts
import { testWrapper } from 'signal-factory/testing';
import { store } from 'signal-factory/store';

const wrapped = testWrapper(store(1));

wrapped.value = 2;

wrapped.history; // [1, 2]

wrapped.subscribe((value) => console.log(value));

wrapped.count; // 1
```
