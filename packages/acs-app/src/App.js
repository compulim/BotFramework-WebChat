import './App.css';

import { ACSChatAdapter } from 'botframework-webchat-chat-adapter-acs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [userProfiles, setUserProfiles] = useState({});

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

  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const refreshUserProfiles = useCallback(() => {
    if (!threadId || !token) {
      return;
    }

    (async function () {
      const res = await fetch(
        new URL(`/chat/threads/${threadId}/members?api-version=2020-09-21-preview2`, endpointURL),
        {
          headers: {
            authorization: `Bearer ${token}`,
            'content-type': 'application/json'
          }
        }
      );

      if (!res.ok) {
        throw new Error('Failed to get thread member list');
      }

      const { value } = await res.json();

      abortController.signal.aborted ||
        setUserProfiles(
          Object.fromEntries(
            value.map(({ id }) => [
              id,
              {
                initials: id.substr(-2),
                name: `User ${id.substr(-4)}`
              }
            ])
          )
        );
    })();
  }, [abortController, endpointURL, setUserProfiles, threadId, token]);

  const handleStartClick = useCallback(() => {
    setStarted(Date.now());
    refreshUserProfiles();
  }, [refreshUserProfiles, setStarted]);

  const styleOptions = useMemo(
    () => ({
      showAvatarForOthers: true,
      showAvatarForSelf: true
    }),
    []
  );

  // const dummyTypingUsers = useMemo(
  //   () => ({
  //     'id-1': {
  //       at: Date.now() + 100001,
  //       name: 'John'
  //     },
  //     'id-2': {
  //       at: Date.now() + 100000,
  //       name: 'Mary'
  //     },
  //     'id-3': {
  //       at: Date.now() + 100000,
  //       name:
  //         'Minim velit pariatur deserunt deserunt nisi consectetur excepteur consectetur elit proident fugiat dolore.'
  //     }
  //   }),
  //   []
  // );

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
          <ACSChatAdapter endpointURL={endpointURL} threadId={threadId} token={token} userProfiles={userProfiles}>
            {chatAdapterProps =>
              chatAdapterProps ? (
                <WebChatWithDebug
                  {...chatAdapterProps}
                  className="app__webchat"
                  styleOptions={styleOptions}
                  // typingUsers={dummyTypingUsers}
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
