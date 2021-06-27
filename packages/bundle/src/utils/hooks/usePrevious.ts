import { useEffect, useRef } from 'react';

// Adopted from https://reactjs.org/docs/hooks-faq.html
export default function usePrevious<T>(value: T, initial?: T): T {
  const ref = useRef<T>(initial);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
