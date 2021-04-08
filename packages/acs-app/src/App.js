import './App.css';

import { ACSChatAdapter } from 'botframework-webchat-chat-adapter-acs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createCognitiveServicesSpeechServicesPonyfillFactory, createDirectLine } from 'botframework-webchat';

import ACSCredentials from './ui/ACSCredentials';
import createFetchSpeechServicesCredentials from './util/createFetchSpeechServicesCredentials';
import useSessionState from './ui/hooks/useSessionState';
import WebChatWithDebug from './ui/WebChatWithDebug';
import DirectLineCredentials from './ui/DirectLineCredentials';

const App = () => {
  const [acsEndpointURL, setACSEndpointURL] = useSessionState('', 'ACS_ENDPOINT_URL');
  const [acsIdentity, setACSIdentity] = useSessionState('', 'ACS_IDENTITY');
  const [acsStarted, setStarted] = useState();
  const [acsThreadId, setACSThreadId] = useSessionState('', 'ACS_THREAD_ID');
  const [acsToken, setACSToken] = useSessionState('', 'ACS_TOKEN');
  const [directLine, setDirectLine] = useState();
  const [directLineToken, setDirectLineToken] = useSessionState('', 'DIRECT_LINE_TOKEN');
  const [userProfiles, setUserProfiles] = useState({});

  const handleACSCredentialsChange = useCallback(
    ({ endpointURL, identity, threadId, token }) => {
      setACSEndpointURL(endpointURL);
      setACSIdentity(identity);
      setACSThreadId(threadId);
      setACSToken(token);
    },
    [setACSEndpointURL, setACSIdentity, setACSThreadId, setACSToken]
  );

  const handleDirectLineCredentialsChange = useCallback(
    ({ token }) => {
      setDirectLineToken(token);
    },
    [setDirectLineToken]
  );

  // TODO: issueToken has some service side issues, returning 404 sometimes and very unreliable
  // const credentials = useCallback(async () => {
  //   const { token } = await issueToken(identity, ['chat']);

  //   return { token };
  // }, [identity]);

  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const refreshUserProfiles = useCallback(() => {
    if (!acsThreadId || !acsToken) {
      return;
    }

    (async function () {
      const res = await fetch(
        new URL(`/chat/threads/${acsThreadId}/members?api-version=2020-09-21-preview2`, acsEndpointURL),
        {
          headers: {
            authorization: `Bearer ${acsToken}`,
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
  }, [abortController, acsEndpointURL, setUserProfiles, acsThreadId, acsToken]);

  const handleACSStartClick = useCallback(() => {
    setStarted(Date.now());
    refreshUserProfiles();
  }, [refreshUserProfiles, setStarted]);

  const handleDirectLineStartClick = useCallback(() => {
    setStarted(Date.now());
    setDirectLine(createDirectLine({ token: directLineToken }));
  }, [setDirectLine, setStarted]);

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
      {acsStarted && (
        <div className="app__webchat-box" key={acsStarted}>
          {directLine ? (
            <WebChatWithDebug directLine={directLine} />
          ) : (
            <ACSChatAdapter
              endpointURL={acsEndpointURL}
              threadId={acsThreadId}
              token={acsToken}
              userProfiles={userProfiles}
            >
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
          )}
        </div>
      )}
      <div className="app__credentials" hidden={!!acsStarted}>
        <ACSCredentials
          endpointURL={acsEndpointURL}
          identity={acsIdentity}
          onChange={handleACSCredentialsChange}
          threadId={acsThreadId}
          token={acsToken}
        >
          <div>
            {/* eslint-disable-next-line jsx-a11y/no-access-key */}
            <button accessKey="s" onClick={handleACSStartClick} type="button">
              Start ACS
            </button>
          </div>
        </ACSCredentials>
        <DirectLineCredentials onChange={handleDirectLineCredentialsChange} token={directLineToken}>
          <div>
            {/* eslint-disable-next-line jsx-a11y/no-access-key */}
            <button accessKey="d" onClick={handleDirectLineStartClick} type="button">
              Start Direct Line
            </button>
          </div>
        </DirectLineCredentials>
      </div>
    </div>
  );
};

export default App;
