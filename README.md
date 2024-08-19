# signal-factory

**signal-factory** é uma biblioteca framework agnostica usada para criar bibliotecas com `state management` que não precisam definir qual framework elas estão utilizando, ou seja, para criar outras biblitecas agnósticas

Tipagem de um signal

```ts
type Signal<T = any> = {
  value: T;
  subscribe: (callback: (value: T) => void) => () => void;
  count?: number; // Opcional para testes
};
```

O **signal-factory** é usado para evitar duplicar esse código entre as [storage-versioning](https://github.com/Simple-Organization/storage-versioning), [glhera-query](https://github.com/Simple-Organization/glhera-query), [glhera-router](https://github.com/Simple-Organization/glhera-router)

O mais importante é entender o conceito por trás do **signal-factory** para evitar duplicar código na maior parte do tempo você pode simplesmente copiar o código do **signal-factory** e usá-lo

**signal-factory** faz parte da **stack do glhera**

## Configurando reatividade (signals)

Possui o método `setSignalFactory` para configurar o tipo de signal que será usado pela aplicação, podendo variar entre `Vue`, `Angular`, `SolidJS`, `PreactJS Signals`

Por padrão o `setSignalFactory` usará o `Atom` interno uma classe muito bem testada e altamente performática, mas você pode modificar a hora que quiser

## Selector

A api do `signal-factory` oferece um `selector`

```ts
import { atom, selector } from 'signal-factory';

const myAtom = atom(1);
const myAtom2 = atom(2);

// Para valores únicos
const singleValue = selector(myAtom, (value) => value + 1);

// Api conveniente para múltiplos valores
// Inspirada do Recoil e Jotai
const multiValue = selector((get) => get(myAtom) + get(myAtom2));
```

### React

React não tem suporte nativo para signals, porém é possível usar [@preact/signals-react](https://www.npmjs.com/package/@preact/signals-react) e usar igual ao [Preact](#preact)

Aí é só usar o código abaixo

```ts
import { signal } from '@preact/signals-react';

setSignalFactory(signal);
```

### Preact signals

Adicionar para o preact com signals é muito simples, de onde a api foi inspirada

```ts
import { signal } from '@preact/signals';

setSignalFactory(signal);
```

Você pode usar também o hook do `signal-factory/preact` e ao invés de usar o `@preact/signals` você pode usar o `atom` para criar os signals

A vantagem dessa abordagem é que ela é explícita do que atom está sendo subscrito comparado `@preact/signals`, e ele também não modifica o `render` interno do preact, podendo salvar performance em algumas circunstancias

```tsx
import { atom } from 'signal-factory';
import { useSubSignals } from 'signal-factory/preact';

// Já vem pré-definido com esse modo
setSignalFactory(atom);

//
// Depois

// Nesse exemplo estamos definindo o counter como global, mas é melhor defini-lo com context
// É mais verboso com context, mas ajuda para testes e SSR, se você não usará testes ou SSR
// sinta-se a vontade de usar como singleton

const counter = atom(1);

//

export function Component() {
  useSubSignals(() => [someAtom]);

  return <button onClick={() => counter.value++}>Count {counter.value}</button>;
}
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

  // Adicionamos direto no objeto para economizar memória e performance
  _signal.subscribe = (cb: (newVal: any) => void) => {
    cb(_signal.value);
    return watch(_signal, cb);
  };

  return _signal;
}
```

### Svelte e vanilla javascript

Você pode simplesmente usar o `atom` que já vem pré-definido

Ou no caso do Svelte você pode adaptar o `writable`

Lembrando que o `atom` que o `signal-factory` é praticamente a mesma coisa que o `writable` do Svelte

Em testes com [benchmark](./tests/benchmark.ts)

| **Benchmark**                                                                | **Atom**                     | **writable**                                                              | **Mais Rápido** | **Vantagem**                                           |
| ---------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------- | --------------- | ------------------------------------------------------ |
| **Atom creation vs writable creation**                                       | 52,569,399 ops/sec ±1.26%    | 64,395,425 ops/sec ±1.41%                                                 | writable        | "writable" é 1.22 vezes mais rápido que "Atom"         |
| **Atom subscribe vs writable subscribe**                                     | 8,951,145 ops/sec ±0.97%     | 6,605,815 ops/sec ±0.73%                                                  | Atom            | "Atom" é 1.36 vezes mais rápido que "writable"         |
| **Atom get value vs writable get value**                                     | 1,315,814,854 ops/sec ±0.09% | 6,188,902 ops/sec ±4.76%                                                  | Atom            | "Atom" é 212.61 vezes mais rápido que "writable"       |
| **Atom set value vs writable set value**                                     | 116,469,300 ops/sec ±0.21%   | 136,845,993 ops/sec ±0.35% (set) <br> 140,188,375 ops/sec ±0.24% (update) | writable.update | "writable.update" é 1.20 vezes mais rápido que "Atom"  |
| **Atom set value with subscription vs writable set value with subscription** | 72,181,055 ops/sec ±0.48%    | 6,000,664 ops/sec ±0.59% (set) <br> 5,853,505 ops/sec ±0.71% (update)     | Atom            | "Atom" é 12.33 vezes mais rápido que "writable.update" |

```ts
setSignalFactory(atom);

//

export function atom<T>(initial: T) {
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
import { createSignal } from 'solid-js';

//
setSignalFactory(signal);

//
export function signal<T>(initial: T): Signal<T> {
  let _value = initial;
  const [value, setValue] = createSignal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value();
    },
    set value(newValue) {
      _value = newValue;
      if (typeof newValue === 'function') {
        setValue(() => newValue);
      } else {
        setValue<any>(newValue);
      }

      for (const callback of callbacks) {
        callback(newValue);
      }
    },

    subscribe,
  };
}
```

### Angular signals

Você pode usar o wrapper `angular` do `signal-factory`

```ts
import { signal } from 'signal-factory/angular';

setSignalFactory(signal);
```

Ou simplesmente copie o código do wrapper abaixo

```ts
import { signal } from '@angular/core';

//
setSignalFactory(signalWrapper);

//
export function signalWrapper<T>(initial: T): Signal<T> {
  const _signal = signal<T>(initial);

  const callbacks = new Set<(value: T) => void>();

  const subscribe = (callback: (value: T) => void) => {
    callback(_signal());
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return _signal();
    },
    set value(newValue) {
      _signal.set(newValue);

      for (const callback of callbacks) {
        callback(newValue);
      }
    },

    subscribe,
  };
}
```

## Testing

A api prove um `wrapper` para poder vizualizar o número de subscrições e o histórico de valores de um signal/atom

```ts
import { testWrapper } from 'signal-factory/testing';
import { atom } from 'signal-factory/vanilla-atom';

const wrapped = testWrapper(atom(1));

wrapped.value = 2;

wrapped.history; // [1, 2]

wrapped.subscribe((value) => console.log(value));

wrapped.count; // 1
```
