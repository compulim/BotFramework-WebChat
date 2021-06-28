/* eslint no-console: "off" */

import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import ScreenReaderText from './ScreenReaderText';
import useStyleSet from './hooks/useStyleSet';

const { useLocalizer } = hooks;

type ErrorBoxProps = {
  error: Error;
  type?: string;
};

const ErrorBox: FC<ErrorBoxProps> = ({ error, type }) => {
  const [{ errorBox: errorBoxStyleSet }] = useStyleSet();
  const localize = useLocalizer();

  return (
    <React.Fragment>
      <ScreenReaderText text={localize('ACTIVITY_ERROR_BOX_TITLE')} />
      <div className={classNames('webchat__error-box', errorBoxStyleSet)}>
        <div className="webchat__error-box__title">{type}</div>
        {/* The callstack between production and development are different, thus, we should hide it for visual regression test */}
        <details className="webchat__error-box__details">
          <summary>{error.message}</summary>
          <pre className="webchat__error-box__code">{error.stack}</pre>
        </details>
      </div>
    </React.Fragment>
  );
};

ErrorBox.defaultProps = {
  type: ''
};

ErrorBox.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
  type: PropTypes.string
};

export default ErrorBox;
