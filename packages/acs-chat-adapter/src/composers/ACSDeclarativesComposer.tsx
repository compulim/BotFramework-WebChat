import { ChatClient, ChatThreadClient } from '@azure/communication-chat';
import { chatClientDeclaratify, DeclarativeChatClient } from '@azure/acs-chat-declarative';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { default as ACSDeclarativesContext } from '../contexts/ACSDeclarativesContext';
import createDebug from '../utils/debug';

let debug;

// TODO: Type "children".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ACSDeclarativesComposer: FC<{ children: any; endpointURL: string; threadId: string; token: string }> = ({
  children,
  endpointURL,
  threadId,
  token
}) => {
  debug || (debug = createDebug('ACSDeclarativesComposer', { backgroundColor: 'red', color: 'white' }));

  // TODO: "CommunicationTokenCredential" is not exported from @azure/communication-chat.
  const credentials = useMemo<{ dispose(): void; getToken(): Promise<{ expiresOnTimestamp: number; token: string }> }>(
    () => ({
      dispose: () => undefined,
      getToken: () =>
        Promise.resolve({
          // TODO: Should we extract the expiry from the token?
          expiresOnTimestamp: Infinity,
          token
        })
    }),
    [token]
  );

  const chatClient = useMemo(() => new ChatClient(endpointURL, credentials), [credentials, endpointURL]);

  const declarativeChatClient = useMemo(
    // TODO: Type ChatClient from @azure/communication-chat is not compatible with @azure/acs-chat-declarative.
    // TODO: What to do with "displayName" and "userId"?
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => chatClientDeclaratify(chatClient as any, { displayName: '', userId: '' }),
    [chatClient]
  );

  const [clientWithRealtimeNotifications, setClientWithRealtimeNotifications] = useState<DeclarativeChatClient>(
    undefined
  );

  // TODO: Verify if this is DeclarativeChatThreadClient or ChatThreadClient.
  const [declarativeChatThreadClient, setDeclarativeChatThreadClient] = useState<ChatThreadClient>(undefined);

  useEffect(() => {
    const abortController = new AbortController();

    // ESLint conflicts with Prettier.
    // eslint-disable-next-line wrap-iife
    (async function () {
      const declarativeChatThreadClient = await declarativeChatClient.getChatThreadClient(threadId);

      // TODO: Fix the typing. Declarative SDK should export the type DeclarativeChatThreadClient.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      abortController.signal.aborted || setDeclarativeChatThreadClient(declarativeChatThreadClient as any);
    })();

    return () => abortController.abort();
  }, [declarativeChatClient, threadId]);

  useEffect(() => {
    const abortController = new AbortController();
    const started = declarativeChatClient.startRealtimeNotifications();

    // ESLint conflicts with Prettier.
    // eslint-disable-next-line wrap-iife
    (async function () {
      await started;

      abortController.aborted || setClientWithRealtimeNotifications(declarativeChatClient);
    })();

    return () => {
      abortController.abort();

      // ESLint conflicts with Prettier.
      // eslint-disable-next-line wrap-iife
      (async function () {
        await started;
        await declarativeChatClient.stopRealtimeNotifications();
      })();
    };
  }, [declarativeChatClient]);

  // TODO: Hack for subscribing messages. Currently the message coming in through real time notification is bugged and does not contains the message.
  //       This code should not be needed if the message from real time notification is going through correctly.
  useEffect(() => {
    if (!declarativeChatThreadClient || clientWithRealtimeNotifications !== declarativeChatClient) {
      return;
    }

    const chatMessageReceivedHandler = () => declarativeChatThreadClient.listMessages().next();

    declarativeChatClient.on('chatMessageReceived', chatMessageReceivedHandler);

    return () => declarativeChatClient.off('chatMessageReceived', chatMessageReceivedHandler);
  }, [declarativeChatClient, declarativeChatThreadClient, clientWithRealtimeNotifications]);

  const context = useMemo<{
    declarativeChatClient: DeclarativeChatClient;
    declarativeChatThreadClient: ChatThreadClient;
    threadId: string;
  }>(() => {
    debug('Creating context', { declarativeChatClient, declarativeChatThreadClient, threadId });

    return {
      declarativeChatClient,
      declarativeChatThreadClient,
      threadId
    };
  }, [declarativeChatClient, declarativeChatThreadClient, threadId]);

  return <ACSDeclarativesContext.Provider value={context}>{children}</ACSDeclarativesContext.Provider>;
};

ACSDeclarativesComposer.defaultProps = {
  children: undefined
};

ACSDeclarativesComposer.propTypes = {
  children: PropTypes.any,
  endpointURL: PropTypes.string.isRequired,
  threadId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired
};

export default ACSDeclarativesComposer;
