import { ChatProvider } from '@azure/acs-ui-sdk';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { ChatAdapter } from './types/ChatAdapter';

import ACSChatMessagesComposer from './composers/ACSChatMessagesComposer';
import ACSThreadMembersComposer from './composers/ACSThreadMembersComposer';
import ActivitiesComposer from './composers/ActivitiesComposer';
import createDebug from './utils/debug';
import resolveFunction from './utils/resolveFunction';
import styleConsole from './utils/styleConsole';
import TypingUsersComposer from './composers/TypingUsersComposer';
import useACSDisplayName from './hooks/useACSDisplayName';
import useACSUserId from './hooks/useACSUserId';
import useActivities from './hooks/useActivities';
import useEmitTypingIndicator from './hooks/useEmitTypingIndicator';
import useNotifications from './hooks/useNotifications';
import useResend from './hooks/useResend';
import useReturnReadReceipt from './hooks/useReturnReadReceipt';
import useSendMessageWithTrackingNumber from './hooks/useSendMessageWithTrackingNumber';
import useTypingUsers from './hooks/useTypingUsers';

let debug;
let internalDebug;

const InternalACSChatAdapter: FC<{ children: (ChatAdapter) => any }> = ({ children }) => {
  // Lazy initializing constants to save loading speed and memory
  internalDebug ||
    (internalDebug = createDebug('<InternalACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [activities] = useActivities();
  const [notifications] = useNotifications();
  const [typingUsers] = useTypingUsers();
  const [userId] = useACSUserId();
  const [username] = useACSDisplayName();
  const emitTypingIndicator = useEmitTypingIndicator();
  const resend = useResend();
  const returnReadReceipt = useReturnReadReceipt();
  const sendMessage = useSendMessageWithTrackingNumber();

  internalDebug([`Rendering %c${activities.length}%c activities`, ...styleConsole('purple')], [{ activities }]);

  return children({
    activities,
    emitTypingIndicator,
    notifications,
    resend,
    returnReadReceipt,
    sendMessage,
    typingUsers,
    userId,
    // TODO: Consider if we need "username" or could be derived from member list.
    username
  });
};

InternalACSChatAdapter.defaultProps = {};

InternalACSChatAdapter.propTypes = {
  children: PropTypes.func.isRequired
};

type ResolvableToken = string | Promise<string> | (() => string) | (() => Promise<string>);

const ACSChatAdapter: FC<{
  children: (adapter?: ChatAdapter) => any;
  endpointURL: string;
  threadId: string;
  token: ResolvableToken;
}> = ({ children, endpointURL, threadId, token }) => {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('<ACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [initialToken, setInitialToken] = useState<string>(() => (typeof token === 'string' ? token : undefined));

  // Perf: decouple for callbacks.
  const tokenForCallbacksRef = useRef<ResolvableToken>();

  tokenForCallbacksRef.current = token;

  const refreshTokenCallback = useCallback(async () => {
    debug('%crefreshTokenCallback%c is being called', ...styleConsole('orange', 'white'));

    const nextToken = await resolveFunction(tokenForCallbacksRef.current);

    debug(['%crefreshTokenCallback%c finished', ...styleConsole('orange', 'white')], [{ token: nextToken }]);

    return nextToken;
  }, [tokenForCallbacksRef]);

  useEffect(() => {
    if (typeof token === 'function') {
      const abortController = new AbortController();

      // eslint-disable-next-line wrap-iife
      (async function () {
        const actualToken = await resolveFunction(token);

        abortController.signal.aborted || setInitialToken(actualToken);
      })();

      return () => abortController.abort();
    }
  }, [setInitialToken, token]);

  const credentialsProvided = !!(endpointURL && initialToken && threadId);

  return credentialsProvided ? (
    <ChatProvider
      displayName=""
      endpointUrl={endpointURL}
      refreshTokenCallback={refreshTokenCallback}
      threadId={threadId}
      token={initialToken}
    >
      {/* DOC-PARITY: It seems <ChatThreadProvider> is not needed because <ChatProvider> will automatically create it */}
      {/* <ChatThreadProvider> */}
      <ACSChatMessagesComposer>
        <ACSThreadMembersComposer>
          <ActivitiesComposer>
            <TypingUsersComposer>
              <InternalACSChatAdapter>{children}</InternalACSChatAdapter>
            </TypingUsersComposer>
          </ActivitiesComposer>
        </ACSThreadMembersComposer>
      </ACSChatMessagesComposer>
      {/* </ChatThreadProvider> */}
    </ChatProvider>
  ) : (
    children()
  );
};

ACSChatAdapter.defaultProps = {};

ACSChatAdapter.propTypes = {
  children: PropTypes.func.isRequired,
  endpointURL: PropTypes.string.isRequired,
  token: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  threadId: PropTypes.string.isRequired
};

export default ACSChatAdapter;
