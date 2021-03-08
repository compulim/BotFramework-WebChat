import { useChatMessages } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';
import { useEffect } from 'react';
import { useFetchMessages, useSubscribeMessage } from '@azure/acs-ui-sdk';

import createDebug from '../../util/debug';
import styleConsole from '../../util/styleConsole';

// This helper is needed because:
// - useChatMessages() won't return conversation history, but only new outgoing messages during this session
// - But if we call fetchMessages() once, it will return conversation history
// - But if we call useSubscribeMessage() on every render, it will return new incoming messages

// I think the API design need some tweaks.

let debug;

export default function useChatMessagesWithFetchAndSubscribe() {
  debug ||
    (debug = createDebug('acs:useChatMessagesWithFetchAndSubscribe', { backgroundColor: 'yellow', color: 'black' }));

  const fetchMessages = useFetchMessages();

  // Required for conversation history.
  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();

      debug('Initial fetch started');

      const messages = await fetchMessages();

      if (abortController.signal.aborted) {
        return;
      }

      debug(
        [
          `Initial fetch done, took ${Date.now() - now} ms for %c${messages.length}%c messages.`,
          ...styleConsole('purple')
        ],
        [messages]
      );
    })();

    return () => abortController.abort();
  }, [fetchMessages]);

  // Required for new incoming messages.
  useSubscribeMessage();

  return useChatMessages();
}
