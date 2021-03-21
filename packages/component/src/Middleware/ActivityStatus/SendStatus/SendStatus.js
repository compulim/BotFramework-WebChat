import { Constants } from 'botframework-webchat-core';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import connectToWebChat from '../../../connectToWebChat';
import ScreenReaderText from '../../../ScreenReaderText';
import SendFailedRetry from './SendFailedRetry';
import useFocus from '../../../hooks/useFocus';
import useStyleSet from '../../../hooks/useStyleSet';

const { useLocalizer, useResendActivity } = hooks;

const {
  ActivityClientState: { SEND_FAILED, SENDING }
} = Constants;

const connectSendStatus = (...selectors) =>
  connectToWebChat(
    ({ focusSendBox, language, postActivity }, { activity }) => ({
      language,
      retrySend: evt => {
        evt.preventDefault();

        postActivity(activity);

        // After clicking on "retry", the button will be removed from the DOM and focus will be lost (back to document.body)
        // This ensures that focus will stay within Web Chat
        focusSendBox();
      }
    }),
    ...selectors
  );

const SendStatus = ({ activity, sendState }) => {
  const [{ sendStatus: sendStatusStyleSet }] = useStyleSet();
  const focus = useFocus();
  const localize = useLocalizer();
  const resendActivity = useResendActivity();

  const sendingText = localize('ACTIVITY_STATUS_SEND_STATUS_ALT_SENDING');

  const label = localize('ACTIVITY_STATUS_SEND_STATUS_ALT', sendingText);

  const {
    channelData: { 'webchat:tracking-number': trackingNumber }
  } = activity;

  // If no tracking number is provided, resend is disabled. And "handleRetryClick" will be falsy.
  const handleRetryClick = useMemo(
    () =>
      trackingNumber &&
      (() => {
        if (trackingNumber) {
          resendActivity(trackingNumber);

          // After clicking on "retry", the button will be gone and focus will be lost (back to document.body)
          // We want to make sure the user stay inside Web Chat
          focus('sendBoxWithoutKeyboard');
        }
      }),
    [focus, resendActivity, trackingNumber]
  );

  return (
    <span className={classNames('webchat__activity-status', sendStatusStyleSet + '')}>
      <ScreenReaderText text={label} />
      <span aria-hidden={true}>
        {sendState === SENDING ? (
          sendingText
        ) : sendState === SEND_FAILED ? (
          <SendFailedRetry onRetryClick={handleRetryClick} />
        ) : (
          false
        )}
      </span>
    </span>
  );
};

SendStatus.propTypes = {
  activity: PropTypes.shape({
    channelData: PropTypes.shape({
      // TODO: Rename "clientTimestamp" to "webchat:client-timestamp".
      clientTimestamp: PropTypes.string,

      // TODO: Rename "state" to "webchat:send-state".
      state: PropTypes.string,
      'webchat:tracking-number': PropTypes.resetWarningCache
    })
  }).isRequired,
  sendState: PropTypes.oneOf([SENDING, SEND_FAILED]).isRequired
};

export default SendStatus;

export { connectSendStatus };
