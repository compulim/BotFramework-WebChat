import classNames from 'classnames';
import React, { memo } from 'react';
import useStyleSet from '../../hooks/useStyleSet';
import Markdownable from './Markdownable';

type FeedbackFormDisclaimerProps = Readonly<{ disclaimer?: string }>;

function FeedbackFormDisclaimer({ disclaimer }: FeedbackFormDisclaimerProps) {
  const [{ feedbackForm }] = useStyleSet();

  return (
    disclaimer && (
      <Markdownable className={classNames('webchat__feedback-form__caption1', feedbackForm + '')} text={disclaimer} />
    )
  );
}

export default memo(FeedbackFormDisclaimer);
export { type FeedbackFormDisclaimerProps };
