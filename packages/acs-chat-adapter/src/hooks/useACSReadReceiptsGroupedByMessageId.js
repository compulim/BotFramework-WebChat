// import { useMemo, useRef } from 'react';

// import arrayEqualsWithAnyOrder from '../util/arrayEqualsWithAnyOrder';
// import createDebug from '../util/debug';
// import useReadReceiptsWithFetchAndSubscribe from './useReadReceiptsWithFetchAndSubscribe';

// let EMPTY_ARRAY;

// // This hook is for converting between two data structures of read receipts.
// // As the hook is called very frequently, result must reuse existing reference as much as possible.

// // Input:
// // [
// //   { chatMessageId: 'm-00001', readOn: new Date(), sender: { communicationUserId: 'u-abc' } } },
// //   { chatMessageId: 'm-00001', readOn: new Date(), sender: { communicationUserId: 'u-xyz' } } },
// //   { chatMessageId: 'm-00002', readOn: new Date(), sender: { communicationUserId: 'u-abc' } }
// // ]

// // Output:
// // {
// //   'm-00001': [
// //     { chatMessageId: 'm-00001', readOn: new Date(), sender: { communicationUserId: 'u-abc' } }, // contains same reference as the first element in input
// //     { chatMessageId: 'm-00001', readOn: new Date(), sender: { communicationUserId: 'u-xyz' } }
// //   ],
// //   'm-00002': [
// //     { chatMessageId: 'm-00002', readOn: new Date(), sender: { communicationUserId: 'u-abc' } }
// //   ]
// // }

// export default function useACSReadReceiptsGroupedByMessageId() {
//   // Lazy initializing constants to save loading speed and memory
//   debug ||
//     (debug = createDebug('useACSReadReceiptsGroupedByMessageId', { backgroundColor: 'lightgray', color: 'black' }));
//   EMPTY_ARRAY || (EMPTY_ARRAY = []);

//   const readReceipts = useReadReceiptsWithFetchAndSubscribe() || EMPTY_ARRAY;
//   const readReceiptsGroupedByMessageIdRef = useRef({});

//   useMemo(() => {
//     const readReceiptsGroupedByMessageId = readReceiptsGroupedByMessageIdRef.current;

//     // Creates a new pool of read receipts, when we process, we will shift elements out until it is emptied.
//     let readReceiptsClone = [...readReceipts];

//     // This is the new result.
//     const nextReadReceiptsGroupedByMessageId = {};

//     while (readReceiptsClone.length) {
//       const { chatMessageId } = readReceiptsClone[0];

//       // Gets the existing array which is keyed by "m-00001".
//       const readReceiptsWithSameMessageId = readReceiptsGroupedByMessageId[chatMessageId];

//       // Constructs a new array which is keyed by "m-00001".
//       const nextReadReceiptsWithSameMessageId = readReceiptsClone.filter(
//         readReceipt => readReceipt.chatMessageId === chatMessageId
//       );

//       // Removes read receipts from the pool.
//       // We might be able to further improve performance by doing inline filter.
//       readReceiptsClone = readReceiptsClone.filter(readReceipt => readReceipt.chatMessageId !== chatMessageId);

//       // If the array actually didn't change, use the old one.
//       nextReadReceiptsGroupedByMessageId[chatMessageId] = arrayEqualsWithAnyOrder(
//         nextReadReceiptsWithSameMessageId,
//         readReceiptsWithSameMessageId
//       )
//         ? readReceiptsWithSameMessageId
//         : nextReadReceiptsWithSameMessageId;
//     }

//     const readReceiptsGroupedByMessageIdEntries = Object.entries(readReceiptsGroupedByMessageId);

//     // Checks if "readReceiptsGroupedByMessageId" is same as "nextReadReceiptsGroupedByMessageId"
//     const unchanged =
//       readReceiptsGroupedByMessageIdEntries.length === Object.keys(nextReadReceiptsGroupedByMessageId).length &&
//       readReceiptsGroupedByMessageIdEntries.every(
//         ([chatMessageId, readReceiptsWithSameMessageId]) =>
//           nextReadReceiptsGroupedByMessageId[chatMessageId] === readReceiptsWithSameMessageId
//       );

//     if (unchanged) {
//       debug('Perf issue: Read receipts from ACS said it has changed, but in fact, its content was not changed at all.');
//     } else {
//       readReceiptsGroupedByMessageIdRef.current = nextReadReceiptsGroupedByMessageId;
//     }
//   }, [readReceipts, readReceiptsGroupedByMessageIdRef]);

//   return readReceiptsGroupedByMessageIdRef.current;
// }
