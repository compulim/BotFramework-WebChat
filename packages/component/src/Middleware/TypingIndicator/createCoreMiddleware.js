import classNames from 'classnames';
import React from 'react';

import TypingAnimation from '../../Assets/TypingAnimation';
import useDirection from '../../hooks/useDirection';
import useLocalize from '../../hooks/useLocalize';
import useStyleSet from '../../hooks/useStyleSet';

const DotIndicator = () => {
  const [{ typingIndicator: typingIndicatorStyleSet }] = useStyleSet();
  const [direction] = useDirection();
  const animationAriaLabel = useLocalize('TypingIndicator');

  return (
    <div className={classNames(typingIndicatorStyleSet + '', direction === 'rtl' && 'webchat__typingIndicator--rtl')}>
      <TypingAnimation aria-label={animationAriaLabel} />
    </div>
  );
};

// TODO: [P4] Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function createCoreMiddleware() {
  return () => () => ({ activeTyping }) => !!Object.keys(activeTyping).length && <DotIndicator />;
}