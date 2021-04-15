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
let EMPTY_MAP;
let PASSTHRU_FN;

function getSequenceId(message: ChatMessageWithStatus) {
  // TODO: Ask ACS to change "sequenceId" from "string" to "number".
  //       2 < 13, but "2" > "13".
  return +message.sequenceId;
}

const ACSChatMessageComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSChatMessagesComposer>', { backgroundColor: 'yellow', color: 'black' }));
  PASSTHRU_FN || (PASSTHRU_FN = value => value);

  const { declarativeChatClient, declarativeChatThreadClient } = useACSDeclaratives();

  // Required for conversation history.
  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();

      debug('Initial fetch started');

      let numMessages;

      for await (const _ of declarativeChatThreadClient.listMessages()) {
        if (abortController.signal.aborted) {
          break;
        }

        numMessages++;
      }

      debug(
        [
          `Initial fetch done, took %c${Date.now() - now} ms%c for %c${numMessages}%c messages.`,
          ...styleConsole('green'),
          ...styleConsole('purple')
        ],
        [numMessages]
      );
    })();

    return () => abortController.abort();
  }, [declarativeChatThreadClient]);

  // TODO: Hack for subscribing messages. Currently the message coming in through real time notification is bugged and does not contains the message.
  //       This code should not be needed if the message from real time notification is going through correctly.
  useEffect(() => {
    const handler = () => declarativeChatThreadClient.listMessages().next();

    declarativeChatClient.on('chatMessageReceived', handler);

    return () => declarativeChatClient.off('chatMessageReceived', handler);
  }, [declarativeChatClient, declarativeChatThreadClient]);

  const chatMessagesMap: Map<string, ChatMessageWithStatus> = useACSChatThreadSelector(
    useCallback(state => state?.chatMessages || EMPTY_MAP, [])
  );

  const chatMessages = useMemo(
    () =>
      Array.from(chatMessagesMap.values()).sort((x, y) => {
        const sequenceIdX = getSequenceId(x);
        const sequenceIdY = getSequenceId(y);

        // eslint-disable-next-line no-magic-numbers
        return sequenceIdX > sequenceIdY ? 1 : sequenceIdX < sequenceIdY ? -1 : 0;
      }),
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
