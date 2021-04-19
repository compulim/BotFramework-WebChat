import { ChatMessageWithStatus } from '@azure/acs-chat-declarative';
import { ConnectivityStatus } from 'botframework-webchat-core';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import ACSChatMessagesContext from '../contexts/ACSChatMessagesContext';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatThreadSelector from '../hooks/useACSChatThreadSelector';
import useACSClients from '../hooks/useACSClients';
import useDebounced from '../hooks/useDebounced';
import usePrevious from '../hooks/usePrevious';
import warn from '../utils/warn';

let debug;

const ACSChatMessageComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSChatMessagesComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSClients();
  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>('connecting');

  // Required for conversation history.
  useEffect(() => {
    if (!declarativeChatThreadClient) {
      return;
    }

    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();

      debug('Initial fetch started');

      let numMessages = 0;

      try {
        // TODO: Is setting "maxPageSize" a good option to batch messages?
        for await (const _ of declarativeChatThreadClient.listMessages({ maxPageSize: 100 })) {
          if (abortController.signal.aborted) {
            break;
          }

          // Set connectivity status to "connected" on the very first message received.
          numMessages++ || setConnectivityStatus('connected');
        }
      } catch (err) {
        abortController.signal.aborted || setConnectivityStatus('fatal');
      }

      debug(
        `Initial fetch done, took %c${Date.now() - now} ms%c for %c${numMessages}%c messages.`,
        ...styleConsole('green'),
        ...styleConsole('purple')
      );
    })();

    return () => abortController.abort();
  }, [declarativeChatThreadClient]);

  const chatMessages: Map<string, ChatMessageWithStatus> = useACSChatThreadSelector(
    useCallback(state => state?.chatMessages, [])
  );

  const prevChatMessages = usePrevious(chatMessages);

  if (chatMessages !== prevChatMessages) {
    if (
      JSON.stringify(Object.fromEntries((chatMessages || new Map()).entries())) ===
      JSON.stringify(Object.fromEntries((prevChatMessages || new Map()).entries()))
    ) {
      warn('🔥🔥🔥 PERFORMANCE chatMessages has changed, but its content was not.', { chatMessages, prevChatMessages });
    }
  }

  // const context = useMemo(
  //   () => ({
  //     chatMessages,
  //     connectivityStatus
  //   }),
  //   [chatMessages, connectivityStatus]
  // );

  // TODO: Remove useDebounced.
  // eslint-disable-next-line no-magic-numbers
  const debouncedChatMessages = useDebounced(chatMessages, 1000);

  const context = useMemo(
    () => ({
      chatMessages: debouncedChatMessages,
      connectivityStatus
    }),
    [connectivityStatus, debouncedChatMessages]
  );

  return <ACSChatMessagesContext.Provider value={context}>{children}</ACSChatMessagesContext.Provider>;
};

ACSChatMessageComposer.defaultProps = {
  children: undefined
};

ACSChatMessageComposer.propTypes = {
  children: PropTypes.any
};

export default ACSChatMessageComposer;
