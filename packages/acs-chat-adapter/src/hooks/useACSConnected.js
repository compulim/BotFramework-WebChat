import { useEffect, useState } from 'react';
import { useFetchMessages } from '@azure/acs-ui-sdk';

import createDebug from '../../util/debug';

let debug;

// Currently, ACS UI SDK does not status on connectivity.
// The easiest way is to check if messages has been fetched or not.
export default function useACSConnected() {
  debug || (debug = createDebug('acs:useACSConnected', { backgroundColor: 'yellow', color: 'black' }));

  const [connected, setConnected] = useState(false);
  const fetchMessages = useFetchMessages();

  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      await fetchMessages();

      abortController.signal.aborted || setConnected(true);
    })();

    return () => abortController.abort();
  }, [fetchMessages]);

  return [connected];
}
