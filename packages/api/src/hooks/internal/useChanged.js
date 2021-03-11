import { useRef } from 'react';

export default function useChanged(value) {
  const prevValueRef = useRef(value);

  if (prevValueRef.current !== value) {
    prevValueRef.current = value;

    return true;
  }

  return false;
}
