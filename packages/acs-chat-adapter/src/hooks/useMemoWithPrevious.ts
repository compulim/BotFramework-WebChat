import { useMemo, useRef } from 'react';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default function useMemoWithPrevious<T>(callback: (prevValue: T) => T, deps: any[]): T {
  const callbackRef = useRef<(value: T) => T>();
  const prevResultRef = useRef<T>();

  callbackRef.current = callback;

  return useMemo(() => {
    const result = callbackRef.current(prevResultRef.current);

    prevResultRef.current = result;

    return result;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbackRef, prevResultRef, ...deps]);
}
