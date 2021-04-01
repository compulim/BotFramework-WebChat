import { ChatProvider } from '@azure/acs-ui-sdk';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChatAdapter } from './types/ChatAdapter';
import { UserProfiles } from './types/UserProfiles';

import ACSChatMessagesComposer from './composers/ACSChatMessagesComposer';
import ACSThreadMembersComposer from './composers/ACSThreadMembersComposer';
import ActivitiesComposer from './composers/ActivitiesComposer';
import createDebug from './utils/debug';
import HonorReadReceiptsComposer from './composers/HonorReadReceiptsCompose';
import resolveFunction from './utils/resolveFunction';
import styleConsole from './utils/styleConsole';
import TypingUsersComposer from './composers/TypingUsersComposer';
import useACSDisplayName from './hooks/useACSDisplayName';
import useACSUserId from './hooks/useACSUserId';
import useActivities from './hooks/useActivities';
import useEmitTyping from './hooks/useEmitTyping';
import useHonorReadReceipts from './hooks/useHonorReadReceipts';
import useNotifications from './hooks/useNotifications';
import useResend from './hooks/useResend';
import useSendMessageWithTrackingNumber from './hooks/useSendMessageWithTrackingNumber';
import useTypingUsers from './hooks/useTypingUsers';

let debug;
let internalDebug;

const InternalACSChatAdapter: FC<{ children: (ChatAdapter) => any; userProfiles: UserProfiles }> = ({ children }) => {
  // Lazy initializing constants to save loading speed and memory
  internalDebug ||
    (internalDebug = createDebug('<InternalACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [activities] = useActivities();
  const [honorReadReceipts, setHonorReadReceipts] = useHonorReadReceipts();
  const [notifications] = useNotifications();
  const [typingUsers] = useTypingUsers();
  const [userId] = useACSUserId();
  const [username] = useACSDisplayName();
  const emitTyping = useEmitTyping();
  const resend = useResend();
  const sendMessage = useSendMessageWithTrackingNumber();

  internalDebug([`Rendering %c${activities.length}%c activities`, ...styleConsole('purple')], [{ activities }]);

  return children({
    activities,
    emitTyping,
    honorReadReceipts,
    notifications,
    resend,
    sendMessage,
    setHonorReadReceipts,
    typingUsers,
    userId,
    // TODO: Consider if we need "username" or could be derived from member list.
    username
  });
};

InternalACSChatAdapter.defaultProps = {};

InternalACSChatAdapter.propTypes = {
  children: PropTypes.func.isRequired,
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  ).isRequired
};

type ResolvableToken = string | Promise<string> | (() => string) | (() => Promise<string>);

const ACSChatAdapter: FC<{
  children: (adapter?: ChatAdapter) => any;
  endpointURL: string;
  threadId: string;
  token: ResolvableToken;
  userProfiles: UserProfiles;
}> = ({ children, endpointURL, threadId, token, userProfiles }) => {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('<ACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [initialToken, setInitialToken] = useState<string>(() => (typeof token === 'string' ? token : undefined));
  const patchedUserProfiles = useMemo<UserProfiles>(() => userProfiles || {}, [userProfiles]);

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
          <ActivitiesComposer userProfiles={patchedUserProfiles}>
            <HonorReadReceiptsComposer>
              <TypingUsersComposer userProfiles={patchedUserProfiles}>
                <InternalACSChatAdapter userProfiles={patchedUserProfiles}>{children}</InternalACSChatAdapter>
              </TypingUsersComposer>
            </HonorReadReceiptsComposer>
          </ActivitiesComposer>
        </ACSThreadMembersComposer>
      </ACSChatMessagesComposer>
      {/* </ChatThreadProvider> */}
    </ChatProvider>
  ) : (
    children()
  );
};

ACSChatAdapter.defaultProps = {
  userProfiles: {}
};

// TODO: Since ACS do not provide profile data, we should have a mapProfile function to convert userId -> (avatar image, initials, name).
ACSChatAdapter.propTypes = {
  children: PropTypes.func.isRequired,
  endpointURL: PropTypes.string.isRequired,
  token: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  threadId: PropTypes.string.isRequired,
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  )
};

export default ACSChatAdapter;
