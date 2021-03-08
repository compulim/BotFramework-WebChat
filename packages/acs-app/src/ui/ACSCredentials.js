import './ACSCredentials.css';

import classNames from 'classnames';
import decodeJWT from 'jwt-decode';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ACSChatThreadMembers from './ACSChatThreadMembers';
import createChatThread from '../network/acs/createChatThread';
import createIdentity from '../network/acs/createIdentity';
import getSettings from '../network/getSettings';
import issueToken from '../network/acs/issueToken';
import useSessionState from './hooks/useSessionState';
import useUniqueId from './hooks/useUniqueId';

const ACSCredentials = ({ children, className, endpointURL, identity, onChange, threadId, token }) => {
  const abortController = useMemo(() => new AbortController(), []);
  const { signal } = abortController;

  useEffect(() => () => abortController.abort(), [abortController]);

  const [busy, setBusy] = useState();
  const [invalidTOTP, setInvalidTOTP] = useState(false);
  const [totp, setTOTP] = useSessionState('', 'ACS_AUTHENTICATOR_TOTP');

  const handleChange = useCallback(
    nextValue =>
      onChange({
        endpointURL,
        identity,
        threadId,
        token,
        ...nextValue
      }),
    [endpointURL, identity, onChange, threadId, token]
  );

  const handleEndpointURLChange = useCallback(
    ({ target: { value } }) => {
      handleChange({
        endpointURL: value
      });
    },
    [handleChange]
  );

  const handleIdentityChange = useCallback(
    ({ target: { value } }) => {
      handleChange({
        identity: value
      });
    },
    [handleChange]
  );

  const handleThreadIdChange = useCallback(
    ({ target: { value } }) => {
      handleChange({
        threadId: value
      });
    },
    [handleChange]
  );

  const handleTokenChange = useCallback(
    ({ target: { value } }) => {
      handleChange({
        token: value
      });
    },
    [handleChange]
  );

  const handleTOTPChange = useCallback(({ target: { value } }) => setTOTP(value), [setTOTP]);
  const callAsyncAndSetState = useCallback(
    async (asyncFn, setStateFn) => {
      setBusy(true);
      setInvalidTOTP(false);

      let result;

      try {
        result = await asyncFn();
      } catch (err) {
        if (/401/.test(err.message)) {
          signal.aborted || setInvalidTOTP(true);
        }

        return;
      } finally {
        signal.aborted || setBusy(false);
      }

      signal.aborted || setStateFn(result);
    },
    [setBusy, setInvalidTOTP, signal]
  );

  const handleCreateChatThreadClick = useCallback(async () => {
    callAsyncAndSetState(
      () => createChatThread('Lunch', [{ id: identity }], { token, totp }),
      ({ multipleStatus }) => {
        const chatThreadId = multipleStatus.find(({ type }) => type === 'Thread').id;

        handleChange({ threadId: chatThreadId });
      }
    );
  }, [callAsyncAndSetState, handleChange, identity, token, totp]);

  const handleCreateIdentityClick = useCallback(async () => {
    callAsyncAndSetState(
      () => createIdentity({ totp }),
      ({ id }) => handleChange({ identity: id })
    );
  }, [callAsyncAndSetState, handleChange, totp]);

  const handleGetSettingsClick = useCallback(async () => {
    handleChange({ endpointURL: '' });

    callAsyncAndSetState(
      () => getSettings({ totp }),
      ({ endpointURL }) => handleChange({ endpointURL })
    );
  }, [callAsyncAndSetState, handleChange, totp]);

  const handleIssueTokenClick = useCallback(async () => {
    callAsyncAndSetState(
      () => issueToken(identity, ['chat'], { totp }),
      ({ token }) => handleChange({ token })
    );
  }, [callAsyncAndSetState, handleChange, identity, totp]);

  const [chatThreadOpened, setChatThreadOpened] = useState();

  const handleThreadMembersToggle = useCallback(
    async ({ target: { open } }) => {
      setChatThreadOpened(open);
    },
    [setChatThreadOpened]
  );

  const totpReady = totp.length === 6;
  const disableCreateChatThreadButton = !(identity && token) || busy || !totpReady;
  const disableCreateIdentityButton = busy || !totpReady;
  const disableGetSettingsButton = busy || !totpReady;
  const disableInputs = busy || !totpReady;
  const disableIssueTokenButton = !identity || busy || !totpReady;

  const decodedToken = useMemo(() => {
    if (token) {
      try {
        const decoded = decodeJWT(token);

        return {
          ...decoded,
          exp: new Date(decoded.exp * 1000).toISOString(),
          iat: new Date(decoded.iat * 1000).toISOString()
        };
      } catch (err) {}
    }
  }, [token]);

  const endpointURLInputIdRef = useUniqueId('acs-credentials');
  const identityInputIdRef = useUniqueId('acs-credentials');
  const threadIdInputIdRef = useUniqueId('acs-credentials');
  const tokenInputIdRef = useUniqueId('acs-credentials');
  const totpInputIdRef = useUniqueId('acs-credentials');

  return (
    <div className={classNames('acs-credentials', (className || '') + '')}>
      <div className="acs-credentials__form">
        <label className="acs-credentials__label" htmlFor={totpInputIdRef}>
          TOTP:
        </label>
        <input
          className="acs-credentials__input"
          id={totpInputIdRef}
          maxLength={6}
          onChange={handleTOTPChange}
          type="tel"
          value={totp}
        />
        {invalidTOTP && <span className="acs-credentials__accessory acs-credentials__red-text">Invalid TOTP</span>}
        <label className="acs-credentials__label" htmlFor={endpointURLInputIdRef}>
          Endpoint URL:
        </label>
        <input
          className="acs-credentials__input"
          disabled={true}
          id={endpointURLInputIdRef}
          onChange={handleEndpointURLChange}
          title={endpointURL}
          type="text"
          value={endpointURL}
        />
        <button
          className="acs-credentials__accessory acs-credentials__button"
          disabled={disableGetSettingsButton}
          onClick={handleGetSettingsClick}
        >
          Get settings
        </button>
        <label className="acs-credentials__label" htmlFor={identityInputIdRef}>
          Identity:
        </label>
        <input
          className="acs-credentials__input"
          disabled={disableInputs}
          id={identityInputIdRef}
          onChange={handleIdentityChange}
          title={identity}
          type="text"
          value={identity}
        />
        <button
          className="acs-credentials__accessory acs-credentials__button"
          disabled={disableCreateIdentityButton}
          onClick={handleCreateIdentityClick}
        >
          Create an identity
        </button>
        <label className="acs-credentials__label" htmlFor={tokenInputIdRef}>
          Token:
        </label>
        <input
          className="acs-credentials__input"
          disabled={disableInputs}
          id={tokenInputIdRef}
          onChange={handleTokenChange}
          title={decodedToken && JSON.stringify(decodedToken, null, 2)}
          type="text"
          value={token}
        />
        <span className="acs-credentials__accessory">
          <button
            className="acs-credentials__button"
            disabled={disableIssueTokenButton}
            onClick={handleIssueTokenClick}
          >
            Issue a token
          </button>
          {decodedToken && Date.now() > decodedToken.exp * 1000 && (
            <span className="acs-credentials__red-text">Token has expired</span>
          )}
        </span>
        <label className="acs-credentials__label" htmlFor={threadIdInputIdRef}>
          Thread ID:
        </label>
        <input
          className="acs-credentials__input"
          disabled={disableInputs}
          id={threadIdInputIdRef}
          onChange={handleThreadIdChange}
          title={threadId}
          type="text"
          value={threadId}
        />
        <button
          className="acs-credentials__accessory acs-credentials__button"
          disabled={disableCreateChatThreadButton}
          onClick={handleCreateChatThreadClick}
        >
          Create a thread
        </button>
      </div>
      <details onToggle={handleThreadMembersToggle}>
        <summary>Thread members</summary>
        {!!chatThreadOpened && <ACSChatThreadMembers threadId={threadId} token={token} totp={totp} />}
      </details>
      {children}
    </div>
  );
};

export default ACSCredentials;
