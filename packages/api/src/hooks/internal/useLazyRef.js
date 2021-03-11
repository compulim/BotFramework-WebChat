import { useRef } from 'react';

const UNINITIALIZED = Symbol();

// useRef hook does not support lazy initializing value
// In other words, useRef(() => 'Hello').current === () => 'Hello', instead of 'Hello'.
// This hook is to supplement the original useRef with lazy initialization.
export default function useLazyRef(initFn) {
  const ref = useRef(UNINITIALIZED);

  if (ref.current === UNINITIALIZED) {
    ref.current = typeof initFn === 'function' ? initFn() : initFn;
  }

  return ref;
}
