import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import createDebug from '../utils/debug';
import fromWho from '../utils/fromWho';
import getActivityKey from '../utils/getActivityKey';
import styleConsole from '../utils/styleConsole';
import useUserId from './useUserID';
import WebChatActivitiesContext from './internal/WebChatActivitiesContext';

let debug;

const ActivitiesComposer = ({ children, dispatch }) => {
  debug || (debug = createDebug('<ActivitiesComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const activities = useSelector(({ activities }) => activities);
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

  const markActivityAsRead = useCallback(
    activity => {
      const activityKey = getActivityKey(activity);

      if (!~activitiesRef.current.indexOf(activity)) {
        return console.warn(
          'botframework-webchat: the activity passed to useMarkActivityKeyAsRead() must be present in the transcript.'
        );
      }

      debug([`Mark activity %c${activityKey}%c as read`, ...styleConsole('purple')], [{ activity }]);

      dispatch({
        payload: activity,
        type: 'CHAT_ADAPTER/MARK_ACTIVITY_AS_READ'
      });
    },
    [activitiesRef]
  );

  const activityKeyMarkAsReadRef = useRef();

  // TODO: Find a way to cache and only mark as read when activity key changed.
  // TODO: Add a flag to enable/disable auto mark as read, e.g. for DOM document.onvisibilitychange.
  useMemo(() => {
    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      if (fromWho(activity) === 'others') {
        if (
          !activity.channelData['webchat:read-at'][userId] &&
          activityKeyMarkAsReadRef.current !== getActivityKey(activity)
        ) {
          activityKeyMarkAsReadRef.current = getActivityKey(activity);
          markActivityAsRead(activity);
        }

        return;
      }
    }
  }, [activities, activityKeyMarkAsReadRef, markActivityAsRead, userId]);

  const context = useMemo(
    () => ({
      activities
    }),
    [activities]
  );

  return <WebChatActivitiesContext.Provider value={context}>{children}</WebChatActivitiesContext.Provider>;
};

ActivitiesComposer.defaultProps = {
  children: undefined
};

ActivitiesComposer.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired
};

export default ActivitiesComposer;
