/* eslint react/prop-types: "off"*/

import { Constants, getMetadata } from 'botframework-webchat-core';
import React, { useMemo } from 'react';

// import useGetSendTimeoutForActivity from './useGetSendTimeoutForActivity';
// import useTimePassed from './internal/useTimePassed';
import useAPIContext from './internal/useAPIContext';

const {
  ActivityClientState: { SEND_FAILED, SENDING, SENT }
} = Constants;

const ActivityStatusContainer = ({ activity, hideTimestamp, nextVisibleActivity }) => {
  const { activityStatusRenderer: createActivityStatusRenderer } = useAPIContext();
  // const getSendTimeoutForActivity = useGetSendTimeoutForActivity();

  // SEND_FAILED from the activity is ignored, and is instead based on styleOptions.sendTimeout.
  // Note that the derived state is time-sensitive. The useTimePassed() hook is used to make sure it changes over time.

  const { deliveryStatus, who } = getMetadata(activity);

  // const activitySent = typeof deliveryStatus === 'string' ? deliveryStatus === 'sent' : state !== SENDING && state !== SEND_FAILED;
  // const fromUser = role === 'user';
  const fromUser = who === 'self';

  // TODO: We should move "sendTimeout" to chat adapter
  // const sendTimeout = getSendTimeoutForActivity({ activity });

  // const pastTimeout = useTimePassed(fromUser && !activitySent ? new Date(clientTimestamp).getTime() + sendTimeout : 0);

  // const pastTimeout = false;

  // const sendState = activitySent || !fromUser ? SENT : pastTimeout ? SEND_FAILED : SENDING;

  const sendState = !fromUser
    ? SENT
    : deliveryStatus === 'sending'
    ? SENDING
    : deliveryStatus === 'error'
    ? SEND_FAILED
    : SENT;

  return useMemo(
    () =>
      createActivityStatusRenderer({
        activity,
        hideTimestamp,
        nextVisibleActivity, // "nextVisibleActivity" is for backward compatibility, please remove this line on or after 2022-07-22.
        sameTimestampGroup: hideTimestamp, // "sameTimestampGroup" is for backward compatibility, please remove this line on or after 2022-07-22.
        sendState
      }),
    [activity, createActivityStatusRenderer, hideTimestamp, nextVisibleActivity, sendState]
  );
};

export default function useCreateActivityStatusRenderer() {
  return useMemo(
    () => ({ activity, nextVisibleActivity }) => ({ hideTimestamp } = {}) => (
      <ActivityStatusContainer
        activity={activity}
        hideTimestamp={hideTimestamp}
        nextVisibleActivity={nextVisibleActivity}
      />
    ),
    []
  );
}
