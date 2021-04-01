// TODO: Write tests

import useMemoWithPrevious from './useMemoWithPrevious';

export default function useMapper<T, U>(nextArray: T[], mapper: (value: T) => U): U[] {
  const { result } = useMemoWithPrevious<{ array: T[]; result: U[] }>(
    ({ array, result } = { array: [], result: [] }) => {
      if (!nextArray) {
        return { array: nextArray, result: nextArray };
      }

      let resultCached = true;
      let nextResult = [];

      nextArray.forEach((element, index) => {
        if (array[index] === element) {
          return nextResult.push(result[index]);
        }

        resultCached = false;

        const lastIndex = array.indexOf(element);

        if (~lastIndex) {
          return nextResult.push(result[lastIndex]);
        }

        nextResult.push(mapper.call(nextArray, element, index));
      });

      if (resultCached) {
        // If the result is from cache, then, use the last result instead.
        nextResult = result;
      }

      return { array: nextArray, result: nextResult };
    },
    [mapper, nextArray]
  );

  return result;
}
