# Desenvolvimento do Projeto

## Dúvidas do autor - 18 Agosto de 2024

Será se eu incorporo o `signal-factory/vanilla-atom` como padrão? Ou seja, se não usar nada, ele usa o `vanilla-atom`

- Atualizado 2024-08-19 - Acabei definindo que sim, `vanilla-atom` está incorporado

Além do mais eu estava pensando em criar o `signal-factory/vanilla-signal` que ao invés de usar o `selector`, usa o `computed`

Também estava pensando em criar o `signal-factory/vanilla-class-atom` que usa o `Atom` como class, queria criar esse, e fazer `benchmarks` a respeito do uso do `atom` vs `Atom`, especialmente no que se diz a respeito de memória

- Atualizado 2024-08-19 - Eu cheguei a criar e o padrão está `Atom` como class

## Dúvidas do autor - 19 Agosto de 2024

Em `benchmarks` que eu fiz, o `writable` do `Svelte` é criado mais rápido do que o `Atom` class

O `Atom` class é muito mais rápido do que o `atom` não class com `.value`

Mas o que eu descobri, é que usar o `.value` como propriedade é que é o problema, caso ele use um método como `.get` ele é muito mais rápido, chegando a 60 vezes mais rápido

E usar com `.get` também tem a vantagem que tem melhor integração com o `React` com o [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), e é muito importante ter uma boa integração com o `React` se quiser que a lib faça sucesso
