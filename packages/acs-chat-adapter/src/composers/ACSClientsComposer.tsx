import { ChatClient, ChatThreadClient } from '@azure/communication-chat';
import { chatClientDeclaratify, DeclarativeChatClient } from '@azure/acs-chat-declarative';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { default as ACSDeclarativesContext } from '../contexts/ACSClientsContext';
import createDebug from '../utils/debug';

// TODO: This is from acs-ui-sdk, we need it.
const getIdFromToken = jwtToken => {
  const claimName = 'skypeid';
  const jwtTokenParts = jwtToken.split('.');
  // eslint-disable-next-line no-magic-numbers
  if (jwtTokenParts.length !== 3) {
    throw new Error('invalid jwt token');
  }
  const base64DecodedClaims = atob(jwtTokenParts[1]);
  const base64DecodedClaimsAsJson = JSON.parse(base64DecodedClaims);
  if (Object.prototype.hasOwnProperty.call(base64DecodedClaimsAsJson, claimName)) {
    return `8:${base64DecodedClaimsAsJson[claimName]}`;
  }
  throw new Error('invalid access token');
};

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

  const userId = useMemo(() => getIdFromToken(token), [token]);

  const context = useMemo<{
    declarativeChatClient: DeclarativeChatClient;
    declarativeChatThreadClient: ChatThreadClient;
    threadId: string;
    userId: string;
  }>(() => {
    debug('Creating context', { declarativeChatClient, declarativeChatThreadClient, threadId, userId });

    return {
      declarativeChatClient,
      declarativeChatThreadClient,
      threadId,
      userId
    };
  }, [declarativeChatClient, declarativeChatThreadClient, threadId, userId]);

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
