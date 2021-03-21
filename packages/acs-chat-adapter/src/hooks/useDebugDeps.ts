/* eslint no-console: "off" */

import { useMemo, useRef } from 'react';

import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';

function repeat(array, count) {
  const result = [];

  for (let index = 0; index < count; index++) {
    result.push(...array);
  }

  return result;
}

export default function useDebugDeps<T>(depsMap: T, name: string): void {
  const debug = useMemo(() => createDebug(`useDebugDeps:${name}`, { backgroundColor: 'black' }), [name]);
  const lastDepsMapRef = useRef<Partial<T>>({});

  const { current: lastDepsMap } = lastDepsMapRef;
  const keys = new Set([...Object.keys(depsMap), ...Object.keys(lastDepsMap)]);
  const keysChanged = Array.from(keys).filter(key => !Object.is(depsMap[key], lastDepsMap[key]));
  const { length: numKeysChanged } = keysChanged;

  numKeysChanged &&
    debug(
      [
        `%c${numKeysChanged} changes%c found: ${keysChanged.map(key => `%c${key}%c`).join(', ')}`,
        ...styleConsole('purple'),
        ...repeat(styleConsole('green'), numKeysChanged)
      ],
      [
        'Changed',
        keysChanged.reduce((result, key) => ({ ...result, [key]: { from: lastDepsMap[key], to: depsMap[key] } }), {})
      ],
      [
        'Unchanged',
        Array.from(keys)
          .filter(key => !keysChanged.includes(key))
          .reduce((result, key) => ({ ...result, [key]: { from: lastDepsMap[key], to: depsMap[key] } }), {})
      ]
    );

  lastDepsMapRef.current = depsMap;
}
