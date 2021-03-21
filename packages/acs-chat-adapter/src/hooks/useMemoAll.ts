// TODO: Maybe not used.
import { useMemo } from 'react';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default function useMemoAll<T, U>(fn: (...args: any[]) => T, callback: (...args: any[]) => any): U {
  if (typeof fn !== 'function') {
    throw new Error('The first argument must be a function.');
  } else if (typeof callback !== 'function') {
    throw new Error('The second argument must be a function.');
  }

  const memoizedFn = useMemo(() => {
    let cache = [];

    return callback => {
      const nextCache = [];
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const result = callback((...args: any[]) => {
        const { result } = [...cache, ...nextCache].find(
          ({ args: cachedArgs }) =>
            args.length === cachedArgs.length && args.every((arg, index) => Object.is(arg, cachedArgs[index]))
        ) || { result: fn(...args) };

        nextCache.push({ args, result });

        return result;
      });

      cache = nextCache;

      return result;
    };
  }, [fn]);

  return memoizedFn(callback);
}
