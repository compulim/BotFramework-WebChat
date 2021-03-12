import { useEffect } from 'react';
import { useFetchReadReceipts, useSubscribeReadReceipt } from '@azure/acs-ui-sdk';
import { useReceipts } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';

import createDebug from '../../util/debug';
import styleConsole from '../../util/styleConsole';

// This helper is needed because:
// - useChatMessages() won't return conversation history, but only new outgoing messages during this session
// - But if we call fetchReadReceipts() once, it will return conversation history
// - But if we call useSubscribeReadReceipt() on every render, it will return new incoming messages

// I think the API design need some tweaks.

let debug;

export default function useReadReceiptsWithFetchAndSubscribe() {
  debug ||
    (debug = createDebug('acs:useReadReceiptsWithFetchAndSubscribe', { backgroundColor: 'yellow', color: 'black' }));

  const fetchReadReceipts = useFetchReadReceipts();

  // Required for conversation history.
  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();

      debug('Initial fetch started');

      const readReceipts = await fetchReadReceipts();

      if (abortController.signal.aborted) {
        return;
      }

      debug(
        [
          `Initial fetch done, took ${Date.now() - now} ms for %c${readReceipts.length}%c read receipts.`,
          ...styleConsole('purple')
        ],
        [readReceipts]
      );
    })();

    return () => abortController.abort();
  }, [fetchReadReceipts]);

  // Required for new incoming messages.
  useSubscribeReadReceipt();

  return useReceipts();
}
