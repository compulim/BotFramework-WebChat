import createDeferred from 'p-defer';

export default function createCriticalSection() {
  const queue = [];

  return async fn => {
    const deferred = createDeferred();

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
