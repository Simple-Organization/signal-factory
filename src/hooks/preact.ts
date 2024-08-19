import type { ReadableSignal } from '..';
import { useEffect, useState, useRef } from 'preact/hooks';

//
//

export function useSubSignals<T>(getter: () => ReadableSignal<T>[]) {
  const state = useState<any>();
  const ref = useRef<any>();

  ref.current = state;

  //

  useEffect(() => {
    const signals = getter();
    let subscriptions = new Set<() => void>();

    const callback = () => {
      ref.current[1](!ref.current[0]);
    };

    for (const signal of signals) {
      subscriptions.add(signal.subscribe(callback));
    }

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
}
