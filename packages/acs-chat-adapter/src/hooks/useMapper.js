// TODO: Write tests

import { useMemo, useRef } from 'react';

import createDebug from '../../util/debug';
import styleConsole from '../../util/styleConsole';

let debug;

export default function useMapper(array, mapper) {
  debug || (debug = createDebug('util:useMapper', { backgroundColor: 'lightgray', color: 'black' }));

  const debugMemoizedRef = useRef();
  const fromRef = useRef([]);
  const lastResultRef = useRef([]);
  const resultCachedRef = useRef();

  debugMemoizedRef.current = true;
  resultCachedRef.current = true;

  const nextResult = useMemo(() => {
    debugMemoizedRef.current = false;

    // Perf: caching current acessor
    const { current: from } = fromRef;
    const { current: lastResult } = lastResultRef;
    const nextResult = [];

    array.forEach((element, index) => {
      if (from[index] === element) {
        return nextResult.push(lastResult[index]);
      }

      resultCachedRef.current = false;

      const lastIndex = from.indexOf(element);

      if (~lastIndex) {
        return nextResult.push(lastResult[lastIndex]);
      }

      nextResult.push(mapper.call(array, element, index));
    });

    // If the result is from cache, then, use the last result instead.
    if (resultCachedRef.current) {
      return lastResultRef.current;
    }

    return nextResult;
  }, [array, debugMemoizedRef, fromRef, lastResultRef, mapper, resultCachedRef]);

  if (debugMemoizedRef.current) {
    // debug('Memoize %chit%c', ...styleConsole('green', 'white'));
  } else if (resultCachedRef.current) {
    // Seeing this log line means performance issue in the input.
    // If the input is memoized correctly, we should not see this line.
    debug(
      [
        'Not memoized but %ccache hit%c, this is very likely %cwasted render%c',
        ...styleConsole('red'),
        ...styleConsole('red')
      ],
      [{ array, from: fromRef.current, lastResult: lastResultRef.current, nextResult }]
    );
  } else {
    // The input array has changed and we updated our output.
    debug('Not memoized and %ccache miss%c', ...styleConsole('green'));
  }

  fromRef.current = array;
  lastResultRef.current = nextResult;

  return nextResult;
}
