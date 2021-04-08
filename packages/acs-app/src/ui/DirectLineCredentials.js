import './DirectLineCredentials.css';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import fetchToken from '../network/directLine/fetchToken';
import useUniqueId from './hooks/useUniqueId';

const DirectLineCredentials = ({ children, className, onChange, token }) => {
  const [disableFetchTokenButton, setDisableFetchTokenButton] = useState();
  const tokenIdRef = useUniqueId();

  const handleFetchTokenButton = useCallback(() => {
    onChange({ token: '' });
  }, [onChange]);

  useEffect(() => {
    if (token) {
      return;
    }

    const abortController = new AbortController();

    setDisableFetchTokenButton(true);

    (async function () {
      const token = await fetchToken();

      if (!abortController.signal.aborted) {
        setDisableFetchTokenButton(true);
        onChange && onChange({ token });
      }
    })();

    return () => abortController.abort();
  }, [onChange, setDisableFetchTokenButton, token]);

  return (
    <div className={classNames('direct-line-credentials', (className || '') + '')}>
      <div className="direct-line-credentials__form">
        <label className="direct-line-credentials__label" htmlFor={tokenIdRef}>
          Token:
        </label>
        <input className="direct-line-credentials__input" id={tokenIdRef} readOnly={true} value={token} />
        <button
          className="direct-line-credentials__accessory direct-line-credentials__button"
          disabled={disableFetchTokenButton}
          onClick={handleFetchTokenButton}
        >
          Fetch token
        </button>
      </div>
      {children}
    </div>
  );
};

DirectLineCredentials.defaultProps = {
  children: undefined,
  className: undefined,
  onChange: undefined,
  token: undefined
};

DirectLineCredentials.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  onChange: PropTypes.func,
  token: PropTypes.string
};

export default DirectLineCredentials;
