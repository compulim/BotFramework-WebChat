import './App.css';

import { ACSChatAdapter } from 'botframework-webchat-chat-adapter-acs';
import React, { useCallback, useEffect, useState } from 'react';
import { createCognitiveServicesSpeechServicesPonyfillFactory } from 'botframework-webchat';

import ACSCredentials from './ui/ACSCredentials';
import createFetchSpeechServicesCredentials from './util/createFetchSpeechServicesCredentials';
import useSessionState from './ui/hooks/useSessionState';
import WebChatWithDebug from './ui/WebChatWithDebug';

const App = () => {
  const [endpointURL, setEndpointURL] = useSessionState('', 'ACS_ENDPOINT_URL');
  const [identity, setIdentity] = useSessionState('', 'ACS_IDENTITY');
  const [started, setStarted] = useState();
  const [threadId, setThreadId] = useSessionState('', 'ACS_THREAD_ID');
  const [token, setToken] = useSessionState('', 'ACS_TOKEN');

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

  const handleStartClick = useCallback(() => setStarted(Date.now()), [setStarted]);

  const [webSpeechPonyfillFactory, setWebSpeechPonyfillFactory] = useState();

  useEffect(() => {
    const abortController = new AbortController();
    const fetchSpeechServicesCredentials = createFetchSpeechServicesCredentials(
      'https://webchat-mockbot.azurewebsites.net/speechservices/token'
    );

    (async function () {
      const webSpeechPonyfillFactory = await createCognitiveServicesSpeechServicesPonyfillFactory({
        credentials: fetchSpeechServicesCredentials
      });

      abortController.signal.aborted || setWebSpeechPonyfillFactory(() => webSpeechPonyfillFactory);
    })();

    return () => abortController.abort();
  }, [setWebSpeechPonyfillFactory]);

  return (
    <div className="app">
      {started && (
        <div className="app__webchat-box" key={started}>
          <ACSChatAdapter endpointURL={endpointURL} threadId={threadId} token={token}>
            {chatAdapterProps =>
              chatAdapterProps ? (
                <WebChatWithDebug
                  {...chatAdapterProps}
                  className="app__webchat"
                  webSpeechPonyfillFactory={webSpeechPonyfillFactory}
                />
              ) : (
                <div>Connecting to ACS&hellip;</div>
              )
            }
          </ACSChatAdapter>
        </div>
      )}
      <div className="app__credentials" hidden={!!started}>
        <ACSCredentials
          endpointURL={endpointURL}
          identity={identity}
          onChange={handleACSCredentialsChange}
          threadId={threadId}
          token={token}
        >
          <div>
            {/* eslint-disable-next-line jsx-a11y/no-access-key */}
            <button accessKey="s" onClick={handleStartClick} type="button">
              Start
            </button>
          </div>
        </ACSCredentials>
      </div>
    </div>
  );
};

export default App;
