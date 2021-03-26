import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React from 'react';

import TypingAnimation from '../../Assets/TypingAnimation';
import useStyleSet from '../../hooks/useStyleSet';

const { useDirection, useLocalizer } = hooks;

const DotTypingIndicator = () => {
  const [{ dotTypingIndicator: dotTypingIndicatorStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const localize = useLocalizer();

  return (
    <div
      className={classNames(
        'webchat__dot-typing-indicator',
        dotTypingIndicatorStyleSet + '',
        direction === 'rtl' && 'webchat__dot-typing-indicator--rtl'
      )}
    >
      <TypingAnimation aria-label={localize('TYPING_INDICATOR_ALT')} />
    </div>
  );
};

export default DotTypingIndicator;
