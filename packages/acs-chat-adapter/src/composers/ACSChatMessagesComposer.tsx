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
import usePrevious from '../hooks/usePrevious';
import warn from '../utils/warn';

const PAGE_SIZE = 100;
let debug;
let EMPTY_MAP;

const ACSChatMessageComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSChatMessagesComposer>', { backgroundColor: 'yellow', color: 'black' }));
  EMPTY_MAP || (EMPTY_MAP = new Map());

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
      let numMessages = 0;

      try {
        // TODO: Is setting "maxPageSize" a good option to batch messages?
        for await (const _ of declarativeChatThreadClient.listMessages({ maxPageSize: PAGE_SIZE })) {
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
        `Initial fetch done, got %c${numMessages}%c messages, took %c${Date.now() - now} ms%c.`,
        ...styleConsole('purple'),
        ...styleConsole('green')
      );
    })();

    return () => abortController.abort();
  }, [declarativeChatThreadClient]);

  const chatMessages: Map<string, ChatMessageWithStatus> = useACSChatThreadSelector(
    useCallback(state => state?.chatMessages || EMPTY_MAP, [])
  );

  const prevChatMessages = usePrevious(chatMessages) || EMPTY_MAP;

  if (chatMessages !== prevChatMessages && chatMessages.size && prevChatMessages.size) {
    if (
      JSON.stringify(Object.fromEntries(chatMessages.entries())) ===
      JSON.stringify(Object.fromEntries(prevChatMessages.entries()))
    ) {
      warn('🔥🔥🔥 PERFORMANCE chatMessages has changed, but its content was not.', { chatMessages, prevChatMessages });
    }
  }

  const context = useMemo(
    () => ({
      chatMessages,
      connectivityStatus
    }),
    [chatMessages, connectivityStatus]
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
