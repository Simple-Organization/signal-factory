import { useEffect, useState } from 'preact/hooks';
import { Signal } from '..';

//
//

export function useSubSignals<T>(getter: () => Signal<T>[]) {
  const state = useState<any>();

  //

  useEffect(() => {
    const signals = getter();
    let subscriptions = new Set<() => void>();

    const callback = () => {
      state[1](!state[0]);
    };

    for (const signal of signals) {
      subscriptions.add(signal.subscribe(callback));
    }

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
}
