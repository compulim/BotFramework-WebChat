import { useMemo, useRef } from 'react';

import createDebug from '../../util/debug';
import styleConsole from '../../util/styleConsole';

let debug;

export default function useMapper(array, mapper) {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('util:useMapper', { backgroundColor: 'lightgray', color: 'black' }));

  const fromRef = useRef([]);
  const lastResultRef = useRef([]);
  const toRef = useRef([]);

  // Variables for debug use only
  const debugCachedRef = useRef();
  const debugMemoizedRef = useRef();

  debugCachedRef.current = false;
  debugMemoizedRef.current = true;

  const result = useMemo(() => {
    debugMemoizedRef.current = false;

    const nextFrom = [];
    const nextTo = [];

    let result = array.map(element => {
      const index = fromRef.current.indexOf(element);
      const transformed = ~index ? toRef.current[index] : mapper(element);

      if (!~nextFrom.indexOf(element)) {
        nextFrom.push(element);
        nextTo.push(transformed);
      }

      return transformed;
    });

    // Commit mapping cache.
    fromRef.current = nextFrom;
    toRef.current = nextTo;

    // Shallow-check if the result same as previous one.
    const { current: lastResult } = lastResultRef;

    if (result.length === lastResult.length && result.every((element, index) => element === lastResult[index])) {
      // No, the result didn't changed, reuse previous result.
      result = lastResultRef.current;
      debugCachedRef.current = true;
    } else {
      // Yes, the result has changed, save the new result.
      lastResultRef.current = result;
      debugCachedRef.current = false;
    }

    return result;
  }, [array, debugCachedRef, debugMemoizedRef, mapper]);

  if (debugMemoizedRef.current) {
    // debug('Memoize %chit%c', ...styleConsole('green', 'white'));
  } else if (debugCachedRef.current) {
    // Seeing this log line means performance issue in the input.
    // If the input is memoized correctly, we should not see this line.
    debug(
      'Not memoized but %ccache hit%c, this is very likely %cwasted render%c',
      ...styleConsole('red'),
      ...styleConsole('red')
    );
  } else {
    // The input array has changed and we updated our output.
    debug('Not memoized and %ccache miss%c', ...styleConsole('green'));
  }

  return result;
}
