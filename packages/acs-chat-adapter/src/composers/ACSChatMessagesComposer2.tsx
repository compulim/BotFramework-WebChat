import { ChatMessageWithStatus } from '@azure/acs-chat-declarative';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useMemo } from 'react';

import ACSChatMessagesContext from '../contexts/ACSChatMessagesContext';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSDeclaratives from '../hooks/useACSDeclaratives';
import useACSChatThreadSelector from '../hooks/useACSChatThreadSelector';

let debug;

function getSequenceId(message: ChatMessageWithStatus) {
  // TODO: Ask ACS to change "sequenceId" from "string" to "number".
  //       2 < 13, but "2" > "13".
  return +message.sequenceId;
}

const ACSChatMessageComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSChatMessagesComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSDeclaratives();

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

      for await (const _ of declarativeChatThreadClient.listMessages()) {
        if (abortController.signal.aborted) {
          break;
        }

        numMessages++;
      }

      debug(
        `Initial fetch done, took %c${Date.now() - now} ms%c for %c${numMessages}%c messages.`,
        ...styleConsole('green'),
        ...styleConsole('purple')
      );
    })();

    return () => abortController.abort();
  }, [declarativeChatThreadClient]);

  const chatMessagesMap: Map<string, ChatMessageWithStatus> = useACSChatThreadSelector(
    useCallback(state => state?.chatMessages, [])
  );

  // TODO: We should move this "map to array" logic inside the <ActivitiesComposer>.
  const chatMessages = useMemo(
    () =>
      chatMessagesMap
        ? Array.from(chatMessagesMap.values()).sort((x, y) => {
            const sequenceIdX = getSequenceId(x);
            const sequenceIdY = getSequenceId(y);

            // eslint-disable-next-line no-magic-numbers
            return sequenceIdX > sequenceIdY ? 1 : sequenceIdX < sequenceIdY ? -1 : 0;
          })
        : [],
    [chatMessagesMap]
  );

  return <ACSChatMessagesContext.Provider value={chatMessages}>{children}</ACSChatMessagesContext.Provider>;
};

ACSChatMessageComposer.defaultProps = {
  children: undefined
};

ACSChatMessageComposer.propTypes = {
  children: PropTypes.any
};

export default ACSChatMessageComposer;
