import { test, expect } from '@playwright/test';
import { createMemo, createRoot, createSignal } from 'solid-js';
import { computed, ref, watch } from 'vue';
import {
  signal as angularSignal,
  computed as angularComputed,
} from '@angular/core';

//
//

test.describe('frameworks internals', () => {
  let unsubs: (() => void)[] = [];

  test.afterEach(() => {
    unsubs.forEach((unsub) => unsub());
    unsubs = [];
  });

  //
  //

  test.fail('@vue computed must be called immediately', async () => {
    //
    // Apparently, Vue's computed properties are not called immediately, they are called lazily
    const signal = ref('hello');

    let called = false;

    const computedValue = computed(() => {
      called = true;
      return signal.value + ' world';
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(called).toBe(true);
    expect(computedValue.value).toBe('hello world');
  });

  //
  //

  test('@vue computed will batch its updates', async () => {
    const signal1 = ref('hello');
    const signal2 = ref('world');

    let computedCallCount = 0;

    const computedValue = computed(() => {
      computedCallCount++;
      return signal1.value + ' ' + signal2.value;
    });

    let callCount = 0;

    const unsub = watch(computedValue, () => {
      callCount++;
    });

    unsubs.push(unsub);

    signal1.value = 'hello2';
    signal2.value = 'world2';
    signal2.value = 'world3';

    expect(computedValue.value).toBe('hello2 world3');
    expect(computedCallCount).toBe(2);
    expect(callCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(callCount).toBe(1);
  });

  //
  //

  test('@solid createMemo must be called immediately', () => {
    const [signal, setSignal] = createSignal('hello');

    let called = false;

    const computedValue = createMemo(() => {
      called = true;
      return signal() + ' world';
    });

    expect(called).toBe(true);
    expect(computedValue()).toBe('hello world');
  });

  //
  //

  test.fail('@solid createMemo will not batch its updates', () => {
    //
    // For some reason, that code does not work as expected
    const [signal1, setSignal1] = createSignal('hello');
    const [signal2, setSignal2] = createSignal('world');

    let computedCallCount = 0;

    const computedValue = createMemo(() => {
      computedCallCount++;
      return signal1() + ' ' + signal2();
    });

    expect(computedValue()).toBe('hello world');

    setSignal1('hello2');
    setSignal2('world2');
    setSignal2('world3');

    // await new Promise((resolve) => setTimeout(resolve, 0));

    expect(computedValue()).toBe('hello2 world3');
    expect(computedCallCount).toBe(4);
  });

  //
  //

  test.fail('angular computed must be called immediately', () => {
    //
    // Apparently, Angular's computed properties are not called immediately, they are called lazily
    // We cannot properly test this because we cannot call effect outside of Angular injector
    const signal = angularSignal('hello');

    let called = false;

    const computedValue = angularComputed(() => {
      called = true;
      return signal();
    });

    expect(called).toBe(true);
    expect(computedValue()).toBe('hello');
  });
});
