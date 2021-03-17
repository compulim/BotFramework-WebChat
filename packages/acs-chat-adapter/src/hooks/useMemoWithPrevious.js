import { useMemo, useRef } from 'react';

export default function useMemoWithPrevious(callback, deps) {
  const callbackRef = useRef();
  const prevResultRef = useRef();

  callbackRef.current = callback;

  return useMemo(() => {
    const result = callbackRef.current(prevResultRef.current);

    prevResultRef.current = result;

    return result;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbackRef, prevResultRef, ...deps]);
}
