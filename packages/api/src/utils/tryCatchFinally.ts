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
  try {
    let promise: Promise<T>;

    if (typeof functionOrPromise === 'function') {
      // If it is a function, call it and check if it return synchronously or not.
      const result = functionOrPromise();

      // It is a synchronous function.
      if (!isPromise(result)) {
        return result as T; // Returns synchronously.
      }

      // It is an asynchronous function.
      promise = result as Promise<T>;
    } else {
      promise = functionOrPromise;
    }

    return promise.catch(catchFn as (err: Error) => Promise<T>).finally(finallyFn);
  } catch (err) {
    catchFn(err);
  } finally {
    finallyFn();
  }
}
