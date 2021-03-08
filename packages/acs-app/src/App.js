import './App.css';

import { ACSChatAdapter } from 'botframework-webchat-chat-adapter-acs';
import React, { useCallback, useMemo, useState } from 'react';

import ACSCredentials from './ui/ACSCredentials';
import useSessionState from './ui/hooks/useSessionState';
import WebChatWithDebug from './ui/WebChatWithDebug';

// TODO: Remove before flight
const DUMMY_OBSERVABLE = {
  subscribe: () => () => {}
};

const App = () => {
  const [endpointURL, setEndpointURL] = useSessionState('', 'ACS_ENDPOINT_URL');
  const [identity, setIdentity] = useSessionState('', 'ACS_IDENTITY');
  const [started, setStarted] = useState();
  const [threadId, setThreadId] = useSessionState('', 'ACS_THREAD_ID');
  const [token, setToken] = useSessionState('', 'ACS_TOKEN');
  const dummyDirectLine = useMemo(
    () => ({
      activity$: DUMMY_OBSERVABLE,
      connect: () => {},
      connectionStatus$: DUMMY_OBSERVABLE,
      postActivity: () => DUMMY_OBSERVABLE
    }),
    []
  );

  const handleACSCredentialsChange = useCallback(
    ({ endpointURL, identity, threadId, token }) => {
      setEndpointURL(endpointURL);
      setIdentity(identity);
      setThreadId(threadId);
      setToken(token);
    },
    [setEndpointURL, setIdentity, setThreadId, setToken]
  );

  // TODO: issueToken has some service side issues, returning 404 sometimes and very unreliable
  // const credentials = useCallback(async () => {
  //   const { token } = await issueToken(identity, ['chat']);

  //   return { token };
  // }, [identity]);

  const credentials = useCallback(async () => ({ endpointURL, token }), [endpointURL, token]);
  const handleStartClick = useCallback(() => setStarted(Date.now()), [setStarted]);

  return (
    <div className="app">
      {started && (
        <div className="app__webchat-box" key={started}>
          <ACSChatAdapter credentials={credentials} threadId={threadId}>
            {({ connected, store }) =>
              connected ? (
                // At release, this line can be replaced by <ReactWebChat className="app__webchat" store={store} />.
                <WebChatWithDebug className="app__webchat" directLine={dummyDirectLine} store={store} />
              ) : (
                <div>Connecting to ACS&hellip;</div>
              )
            }
          </ACSChatAdapter>
        </div>
      )}
      <ACSCredentials
        className="app__credentials"
        endpointURL={endpointURL}
        identity={identity}
        onChange={handleACSCredentialsChange}
        threadId={threadId}
        token={token}
      >
        <div>
          <button onClick={handleStartClick} type="button">
            Start
          </button>
        </div>
      </ACSCredentials>
    </div>
  );
};

export default App;
