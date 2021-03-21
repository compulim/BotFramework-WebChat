// TODO: Write tests

import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useMemoWithPrevious from './useMemoWithPrevious';

let debug;

export default function useMapper<T, U>(nextArray: T[], mapper: (value: T) => U): U[] {
  debug || (debug = createDebug('util:useMapper', { backgroundColor: 'lightgray', color: 'black' }));

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

        // Seeing this log line means performance issue in the input.
        // If the input is memoized correctly, we should not see this line.
        debug(
          [
            'Not memoized but %ccache hit%c, this is very likely %cwasted render%c',
            ...styleConsole('red'),
            ...styleConsole('red')
          ],
          [{ from: { array, result }, to: { array: nextArray, result: nextResult } }]
        );
      } else {
        // The input array has changed and we updated our output.
        debug('Not memoized and %ccache miss%c', ...styleConsole('green'));
      }

      return { array: nextArray, result: nextResult };
    },
    [mapper, nextArray]
  );

  return result;
}
