import { ChatProvider } from '@azure/acs-ui-sdk';
import { useUserId } from '@azure/acs-ui-sdk/dist/providers/ChatProvider';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import createDebug from './util/debug';
import resolveFunction from './util/resolveFunction';
import styleConsole from './util/styleConsole';
import useACSDisplayName from './hooks/useACSDisplayName';
import useActivities from './hooks/useActivities';
import useEmitTypingIndicator from './hooks/useEmitTypingIndicator';
import useNotifications from './hooks/useNotifications';
import useSendMessageWithSendReceipt from './hooks/useSendMessageWithSendReceipt';
import useSendReadReceipt from './hooks/useSendReadReceipt';
import useTypingUsers from './hooks/useTypingUsers';

let debug;
let internalDebug;

const InternalACSChatAdapter = ({ children }) => {
  // Lazy initializing constants to save loading speed and memory
  internalDebug ||
    (internalDebug = createDebug('<InternalACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [activities] = useActivities();
  const [notifications] = useNotifications();
  const [typingUsers] = useTypingUsers();
  const [userId] = useUserId();
  const [username] = useACSDisplayName();
  const emitTypingIndicator = useEmitTypingIndicator();
  const sendMessage = useSendMessageWithSendReceipt({ activities });
  const sendReadReceipt = useSendReadReceipt();

  internalDebug(
    [`Rendering %c${activities.length}%c activities`, ...styleConsole('purple')],
    [{ activities, notifications, typingUsers, userId }]
  );

  return children({
    activities,
    emitTypingIndicator,
    notifications,
    sendMessage,
    sendReadReceipt,
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

const ACSChatAdapter = ({ children, credentials, threadId }) => {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('<ACSChatAdapter>', { backgroundColor: 'yellow', color: 'black' }));

  const [initialCredentials, setInitialCredentials] = useState();

  const fetchCredentials = useCallback(async () => {
    const { endpointURL, token } = await resolveFunction(credentials);

    return { endpointURL, token };
  }, [credentials]);

  const refreshTokenCallback = useCallback(async () => {
    debug('%crefreshTokenCallback%c is being called', ...styleConsole('orange', 'white'));

    const { endpointURL, token } = await fetchCredentials();

    if (initialCredentials.endpointURL !== endpointURL) {
      console.warn('ACSChatAdapter: "endpointURL" must not be changed when refreshing token.');
    }

    debug(['%crefreshTokenCallback%c finished', ...styleConsole('orange', 'white')], [{ endpointURL, token }]);

    return token;
  }, [fetchCredentials, initialCredentials]);

  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const currentCredentials = await fetchCredentials();

      abortController.signal.aborted || setInitialCredentials(currentCredentials);
    })();

    return () => abortController.abort();
  }, [fetchCredentials, setInitialCredentials]);

  const { endpointURL, token } = initialCredentials || {};
  const credentialsProvided = !!(endpointURL && threadId && token);

  return credentialsProvided ? (
    <ChatProvider
      endpointUrl={endpointURL}
      refreshTokenCallback={refreshTokenCallback}
      threadId={threadId}
      token={token}
    >
      {/* DOC-PARITY: It seems <ChatThreadProvider> is not needed because <ChatProvider> will automatically create it */}
      {/* <ChatThreadProvider> */}
      <InternalACSChatAdapter>{children}</InternalACSChatAdapter>
      {/* </ChatThreadProvider> */}
    </ChatProvider>
  ) : (
    children()
  );
};

ACSChatAdapter.defaultProps = {};

ACSChatAdapter.propTypes = {
  children: PropTypes.func.isRequired,
  credentials: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      token: PropTypes.string
    })
  ]).isRequired,
  threadId: PropTypes.string.isRequired
};

export default ACSChatAdapter;