import PropTypes from 'prop-types';
import React, { useMemo, useRef, useState } from 'react';

import createDebug from '../utils/debug';
import fromWho from '../utils/fromWho';
import getActivityKey from '../utils/getActivityKey';
import styleConsole from '../utils/styleConsole';
import useUserId from './useUserID';
import WebChatActivitiesContext from './internal/WebChatActivitiesContext';

let debug;

const ActivitiesComposer = ({ activities, children, sendReadReceipt }) => {
  debug || (debug = createDebug('<ActivitiesComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const [autoSendReadReceipts, setAutoSendReadReceipts] = useState(true);
  const [userId] = useUserId();

  // Validate "userId" must be set.

  // Validate "activities"
  // 1. Must have channelData;
  // 2. Must have channelData['webchat:key'];
  // 3. Must have channelData['webchat:who'];
  // 4. TBD.

  // Perf: decoupling activities from callback
  const activitiesRef = useRef();

  activitiesRef.current = activities;

  const activityKeyMarkAsReadRef = useRef();

  // TODO: Find a way to cache and only mark as read when activity key changed.
  // TODO: Add a flag to enable/disable auto mark as read, e.g. for DOM document.onvisibilitychange.
  useMemo(() => {
    if (!autoSendReadReceipts || !sendReadReceipt) {
      return;
    }

    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      if (fromWho(activity) === 'others') {
        const activityKey = getActivityKey(activity);

        if (!activity.channelData['webchat:read-at'][userId] && activityKeyMarkAsReadRef.current !== activityKey) {
          activityKeyMarkAsReadRef.current = activityKey;

          debug([`Sending read receipt for activity %c${activityKey}%c`, ...styleConsole('purple')], [{ activity }]);

          sendReadReceipt(activity);
        }

        return;
      }
    }
  }, [activities, activityKeyMarkAsReadRef, autoSendReadReceipts, sendReadReceipt, userId]);

  const context = useMemo(
    () => ({
      activities,
      autoSendReadReceipts,
      setAutoSendReadReceipts
    }),
    [activities, autoSendReadReceipts, setAutoSendReadReceipts]
  );

  return <WebChatActivitiesContext.Provider value={context}>{children}</WebChatActivitiesContext.Provider>;
};

ActivitiesComposer.defaultProps = {
  activities: undefined,
  children: undefined,
  sendReadReceipt: undefined
};

ActivitiesComposer.propTypes = {
  activities: PropTypes.array(
    PropTypes.shape({
      channelData: {
        'webchat:read-at': PropTypes.objectOf(PropTypes.oneOfType([PropTypes.bool, PropTypes.number]))
      }
    })
  ),
  children: PropTypes.any,
  sendReadReceipt: PropTypes.func
};

export default ActivitiesComposer;
