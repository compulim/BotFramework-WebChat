// // TODO: Seems not used.

// import createDeferred from 'p-defer-es5';

// type Deferred<T> = {
//   promise: Promise<T>;
//   reject: (error: Error) => void;
//   resolve: (value: T) => void;
// };

// export default function createProducerConsumerQueue<T, U>(consumer: (value: T) => Promise<U>) {
//   let busy: boolean;
//   const queue: (Deferred<U> & { value: T })[] = [];

//   const trigger = async () => {
//     if (busy) {
//       return;
//     }

//     busy = true;

//     try {
//       while (queue.length) {
//         const { reject, resolve, value } = queue.shift();

//         try {
//           resolve(await consumer(value));
//         } catch (err) {
//           reject(err);
//         }
//       }
//     } finally {
//       busy = false;
//     }
//   };

//   return (value: T): Promise<U> => {
//     const deferred = createDeferred<U>();

//     queue.push({ ...deferred, value });
//     trigger();

//     return deferred.promise;
//   };
// }
