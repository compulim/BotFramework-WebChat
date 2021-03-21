import createDeferred, { DeferredPromise } from 'p-defer';

export default function createCriticalSection<T>(): (fn: () => Promise<T>) => Promise<T> {
  const queue: DeferredPromise<void>[] = [];

  return async (fn: () => Promise<T>): Promise<T> => {
    const deferred = createDeferred<void>();

    queue.push(deferred);

    if (queue.length === 1) {
      deferred.resolve();
    }

    await deferred.promise;

    try {
      return await fn();
    } finally {
      queue.shift();

      const [nextInQueue] = queue;

      nextInQueue && nextInQueue.resolve();
    }
  };
}
