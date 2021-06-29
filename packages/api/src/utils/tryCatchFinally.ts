import isPromise from './isPromise';

/** Synchronous overload, return synchronously. */
export function tryCatchFinally<T>(fn: () => T, catchFn: (err: Error) => void, finallyFn: () => void): T;

/** Asynchronous overload, return a `Promise` object. */
export function tryCatchFinally<T>(
  fn: () => Promise<T>,
  catchFn: (err: Error) => Promise<T>,
  finallyFn: () => void
): Promise<T>;

/** Promise overload, return a `Promise` object. */
export function tryCatchFinally<T>(
  promise: Promise<T>,
  catchFn: (err: Error) => Promise<T>,
  finallyFn: () => void
): Promise<T>;

/**
 * This is try-catch-finally pattern isomorphic to synchronous and asynchronous pattern.
 *
 * If a sync function is passed, it will return its result synchronously.
 *
 * If an async function or `Promise` is passed, it will resolve its result asynchronously.
 */
export default function tryCatchFinally<T>(
  functionOrPromise: (() => T) | (() => Promise<T>) | Promise<T>,
  catchFn: (err: Error) => void | Promise<T>,
  finallyFn: () => void
): T | Promise<T> {
  let promise: Promise<T>;

  if (isPromise(functionOrPromise)) {
    promise = functionOrPromise as Promise<T>;
  } else {
    // If it is a function, call it and check if it return synchronously or not.
    const fn = functionOrPromise as (() => T) | (() => Promise<T>);
    let async: boolean;

    try {
      const result = fn();

      if (!isPromise(result)) {
        // It is a synchronous function.
        return result as T; // Returns synchronously.
      }

      // It is an asynchronous function.
      async = true;
      promise = result as Promise<T>;
    } catch (err) {
      catchFn(err);

      throw err;
    } finally {
      // If fn() is an async function, don't call finallyFn().
      async || finallyFn();
    }
  }

  return promise.catch(catchFn as (err: Error) => Promise<T>).finally(finallyFn);
}
