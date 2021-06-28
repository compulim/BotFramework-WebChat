/**
 * Checks if the `value` is a `Promise` object or not.
 *
 * Supports polyfills by assuming `then` function belongs to a `Promise` object.
 */
export default function isPromise(value: any) {
  // eslint-disable-next-line dot-notation
  return value instanceof Promise || typeof value['then'] === 'function';
}
