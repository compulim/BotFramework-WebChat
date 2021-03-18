// TODO: Maybe not used.
import { useMemo } from 'react';

export default function useMemoAll(fn, callback) {
  if (typeof fn !== 'function') {
    throw new Error('The first argument must be a function.');
  } else if (typeof callback !== 'function') {
    throw new Error('The second argument must be a function.');
  }

  const memoizedFn = useMemo(() => {
    let cache = [];

    return callback => {
      const nextCache = [];
      const result = callback((...args) => {
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
