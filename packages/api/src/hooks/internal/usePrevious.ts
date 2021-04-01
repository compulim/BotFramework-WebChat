import { useEffect, useRef } from 'react';

// Adopted from https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state

export default function usePrevious<T>(value: T): T {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
