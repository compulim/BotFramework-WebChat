// // Disable eslint because maybe not used.
// /* eslint @typescript-eslint/explicit-module-boundary-types: "off" */

// // TODO: Maybe not used.
// import { useMemo, useRef } from 'react';

// import arrayEqualsWithAnyOrder from '../utils/arrayEqualsWithAnyOrder';
// import createDebug from '../utils/debug';
// import styleConsole from '../utils/styleConsole';

// let debug;
// let EMPTY_ARRAY;

// // This hook is for grouping an array into a map.
// // As the hook can be called very frequently, result must reuse existing reference as much as possible.

// // Given:
// // - "key" is a property name which can be configurable;
// // - The order of the input is not important.

// // Input:
// // [
// //   { key: 'id-1', ...someValues },
// //   { key: 'id-1', ...someValues },
// //   { key: 'id-2', ...someValues }
// // ]

// // Output:
// // {
// //   'id-1': [
// //     { key: 'id-1', ...someValues }, // contains same reference as the first element in input
// //     { key: 'id-1', ...someValues }
// //   ],
// //   'id-2': [
// //     { key: 'id-2', ...someValues }
// //   ]
// // }

// export default function useGroupBy(input, keyName) {
//   // Lazy initializing constants to save loading speed and memory
//   debug || (debug = createDebug('useGroupBy', { backgroundColor: 'lightgray', color: 'black' }));
//   EMPTY_ARRAY || (EMPTY_ARRAY = []);

//   const outputRef = useRef({});

//   useMemo(() => {
//     const output = outputRef.current;

//     // Creates a new pool of read receipts, when we process, we will shift elements out until it is emptied.
//     let inputClone = [...input];

//     // This is the new output.
//     const nextOutput = {};

//     while (inputClone.length) {
//       const [{ [keyName]: key }] = inputClone;

//       // Gets the existing child array which is keyed by "id-1".
//       const outputValue = output[key];

//       // Constructs a new child array which is keyed by "id-1".
//       const nextOutputValue = inputClone.filter(inputValue => inputValue[keyName] === key);

//       // Removes elements from the pool.
//       // We might be able to further improve performance by doing inline filter, i.e. without a new array instance.
//       inputClone = inputClone.filter(inputValue => inputValue[keyName] !== key);

//       // If the child array didn't change, use the old one.
//       nextOutput[key] = arrayEqualsWithAnyOrder(nextOutputValue, outputValue) ? outputValue : nextOutputValue;
//     }

//     const outputEntries = Object.entries(output);

//     // Checks if "readReceiptsGroupedByMessageId" is same as "nextReadReceiptsGroupedByMessageId"
//     const unchanged =
//       outputEntries.length === Object.keys(nextOutput).length &&
//       outputEntries.every(([key, value]) => nextOutput[key] === value);

//     if (unchanged) {
//       debug(
//         'Perf issue: Input was changed, but in fact, its content was not changed. %cWaste render%c',
//         ...styleConsole('red')
//       );
//     } else {
//       outputRef.current = nextOutput;
//     }
//   }, [input, keyName, outputRef]);

//   return outputRef.current;
// }
