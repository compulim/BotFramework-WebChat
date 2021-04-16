import { ChatAdapter } from 'botframework-webchat-core';
import { ChatProvider } from '@azure/acs-ui-sdk';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ACSChatMessagesComposer from './composers/ACSChatMessagesComposer2';
import ACSDeclarativesComposer from './composers/ACSDeclarativesComposer';
import ACSParticipantsComposer from './composers/ACSParticipantsComposer';
import ACSReadReceiptsComposer from './composers/ACSReadReceiptsComposer';
import ActivitiesComposer from './composers/ActivitiesComposer';
import createDebug from './utils/debug';
import EmitTypingComposer from './composers/EmitTypingComposer';
import HonorReadReceiptsComposer from './composers/HonorReadReceiptsComposer';
import resolveFunction from './utils/resolveFunction';
import styleConsole from './utils/styleConsole';
import TypingUsersComposer from './composers/TypingUsersComposer';
import useACSUserId from './hooks/useACSUserId';
import useActivities from './hooks/useActivities';
import useEmitTyping from './hooks/useEmitTyping';
import useHonorReadReceipts from './hooks/useHonorReadReceipts';
import useNotifications from './hooks/useNotifications';
import useResend from './hooks/useResend';
import UserProfiles from './types/UserProfiles';
import useSendMessageWithTrackingNumber from './hooks/useSendMessageWithTrackingNumber';
import useTypingUsers from './hooks/useTypingUsers';

let debug;
let internalDebug;

// TODO: We should type "children" prop.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const InternalACSChatAdapter: FC<{ children: (ChatAdapter) => any; userProfiles: UserProfiles }> = ({
  children,
  userProfiles
}) => {
  // Lazy initializing constants to save loading speed and memory
  internalDebug ||
    (internalDebug = createDebug('<InternalACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [activities] = useActivities();
  const [honorReadReceipts, setHonorReadReceipts] = useHonorReadReceipts();
  const [notifications] = useNotifications();
  const [typingUsers] = useTypingUsers();
  const [userId] = useACSUserId();
  const emitTyping = useEmitTyping();
  const resend = useResend();
  const sendMessage = useSendMessageWithTrackingNumber();

  const { [userId]: { name: username } = { name: undefined } } = userProfiles;

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
  // TODO: We should type "children" prop.
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
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
    <ACSDeclarativesComposer endpointURL={endpointURL} threadId={threadId} token={initialToken}>
      <ACSChatMessagesComposer>
        <ACSParticipantsComposer>
          <ACSReadReceiptsComposer>
            <ChatProvider
              displayName=""
              endpointUrl={endpointURL}
              refreshTokenCallback={refreshTokenCallback}
              threadId={threadId}
              token={initialToken}
            >
              {/* DOC-PARITY: It seems <ChatThreadProvider> is not needed because <ChatProvider> will automatically create it */}
              {/* <ChatThreadProvider> */}
              <ActivitiesComposer userProfiles={patchedUserProfiles}>
                <HonorReadReceiptsComposer>
                  <TypingUsersComposer userProfiles={patchedUserProfiles}>
                    <EmitTypingComposer>
                      <InternalACSChatAdapter userProfiles={patchedUserProfiles}>{children}</InternalACSChatAdapter>
                    </EmitTypingComposer>
                  </TypingUsersComposer>
                </HonorReadReceiptsComposer>
              </ActivitiesComposer>
              {/* </ChatThreadProvider> */}
            </ChatProvider>
          </ACSReadReceiptsComposer>
        </ACSParticipantsComposer>
      </ACSChatMessagesComposer>
    </ACSDeclarativesComposer>
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
  threadId: PropTypes.string.isRequired,
  token: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  )
};

export default ACSChatAdapter;
