import { useRef } from 'react';
import random from 'math-random';

export default function useUniqueId(prefix) {
  prefix && (prefix += '--');

  const idRef = useRef(prefix + random().toString(36).substr(2, 5));

  return idRef.current;
}
