import { Signal, signalFactory } from '..';

//
//

export class MultiSelector<T> {
  private from: Signal<any>[] | undefined;
  private values: any[] | undefined;

  private internal: Signal<T>;

  private unsubscribes: (() => void)[] | undefined;
  private numSubscribers = 0;
  private hasValue = false;

  constructor(private getter: (get: <U>(signal: Signal<U>) => U) => T) {
    this.internal = signalFactory<T>(undefined as any);
  }

  //
  //

  get value() {
    if (!this.hasValue) {
      this.firstGet();
    } else if (this.numSubscribers === 0) {
      return this.getValue();
    }
    return this.internal.value;
  }

  //
  //

  private firstGet(): any {
    this.from = [];

    const getMethod = (signal: Signal<any>) => {
      if (!this.from!.includes(signal)) {
        this.from!.push(signal);
      }
      return signal.value;
    };

    this.values = [];

    for (const signal of this.from!) {
      this.values.push(signal.value);
    }

    this.internal.value = this.getter(getMethod);

    this.hasValue = true;
  }

  //
  //

  subscribe(callback: (value: any) => void) {
    if (!this.hasValue) {
      this.firstGet();
    }

    if (!this.unsubscribes) {
      let firstSubscribe = true;
      this.unsubscribes = [];

      for (let i = 0; i < this.from!.length; i++) {
        const unsub = this.from![i].subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          this.values![i] = signalValue;
          this.internal.value = this.getter((signal) => signal.value);
        });

        this.unsubscribes.push(unsub);
      }

      firstSubscribe = false;
    }

    const unsub = this.internal.subscribe(callback);

    this.numSubscribers++;

    return () => {
      unsub();
      this.numSubscribers--;

      if (this.numSubscribers === 0) {
        for (const unsubscribe of this.unsubscribes!) {
          unsubscribe();
          this.unsubscribes = undefined;
        }
      }
    };
  }

  //
  //

  private getValue(): any {
    this.values = [];

    for (const signal of this.from!) {
      this.values.push(signal.value);
    }

    this.internal.value = this.getter((signal) => signal.value);
    return this.internal.value;
  }

  //
  //

  get count() {
    return this.numSubscribers;
  }
}
