export default function resolveFunction<T>(fnOrValue: T | Promise<T> | (() => T) | (() => Promise<T>)): Promise<T> {
  if (typeof fnOrValue === 'function') {
    /* eslint-disable-next-line @typescript-eslint/ban-types */
    return (fnOrValue as Function)();
  }

  return Promise.resolve(fnOrValue);
}
