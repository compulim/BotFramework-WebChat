import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import createDebug from '../../utils/debug';
import fromWho from '../../utils/fromWho';
import getActivityKey from '../../utils/getActivityKey';
import styleConsole from '../../utils/styleConsole';
import useCreateActivityRenderer from '../useCreateActivityRenderer';
import useCreateActivityStatusRenderer from '../useCreateActivityStatusRenderer';
import useMemoAll from './useMemoAll';
import useMemoWithPrevious from './useMemoWithPrevious';
import useUserId from '../useUserID';
import warn from '../../utils/warn';
import WebChatActivitiesContext from './WebChatActivitiesContext';

let debug;

const ActivitiesComposer = ({ activities, children, sendReadReceipt }) => {
  debug || (debug = createDebug('<ActivitiesComposer>', { backgroundColor: 'yellow', color: 'black' }));

  // Validate every activity
  useMemoWithPrevious(() => {
    activities.every(activity => activity.channelData) ||
      warn('🔥🔥🔥 All activities must have a property bag named "channelData".');

    activities.every(activity => activity.channelData['webchat:who']) ||
      warn(`🔥🔥🔥 All activities must have "channelData['webchat:who']" set.`);

    activities.every(getActivityKey) || warn('🔥🔥🔥 All activities must have a key.');

    // TODO: For accessibility, no activities can be inserted at start or in the midway

    // TODO: Add more validations

    return activities;
  }, [activities]);

  const [autoReturnReadReceipts, setAutoReturnReadReceipts] = useState(!!sendReadReceipt);
  const [userId] = useUserId();

  // Validate "userId" must be set.

  const lastReadActivityKeyRef = useRef();

  // TODO: Find a way to cache and only mark as read when activity key changed.
  // TODO: Add a flag to enable/disable auto mark as read, e.g. for DOM document.onvisibilitychange.
  useMemo(() => {
    if (!autoReturnReadReceipts || !sendReadReceipt) {
      return;
    }

    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      if (fromWho(activity) === 'others') {
        const activityKey = getActivityKey(activity);

        if (!activity.channelData['webchat:read-at'][userId] && lastReadActivityKeyRef.current !== activityKey) {
          lastReadActivityKeyRef.current = activityKey;

          debug([`Sending read receipt for activity %c${activityKey}%c`, ...styleConsole('purple')], [{ activity }]);

          sendReadReceipt(activity);
        }

        return;
      }
    }
  }, [activities, autoReturnReadReceipts, lastReadActivityKeyRef, sendReadReceipt, userId]);

  // Gets renderer for every activity.
  // Activities that are not visible will return a falsy renderer.
  const createActivityRenderer = useCreateActivityRenderer();
  const createActivityStatusRenderer = useCreateActivityStatusRenderer();

  const createActivityRendererAndActivityStatusRenderer = useCallback(
    (activity, nextVisibleActivity) => {
      const renderActivity = createActivityRenderer({ activity, nextVisibleActivity });

      if (renderActivity) {
        const renderActivityStatus = createActivityStatusRenderer({ activity });

        return { activity, renderActivity, renderActivityStatus };
      }
    },
    [createActivityRenderer, createActivityStatusRenderer]
  );

  // Create a memoized context of the createActivityRenderer function.
  const activitiesWithRenderer = useMemoAll(
    createActivityRendererAndActivityStatusRenderer,
    createActivityRendererAndActivityStatusRendererMemoized => {
      // All calls to createActivityRendererAndActivityStatusRendererMemoized() in this function will be memoized (LRU = 1).
      // In the next render cycle, calls to createActivityRendererAndActivityStatusRendererMemoized() might return the memoized result instead.
      // This is an improvement to React useMemo(), because it only allows 1 memoization.
      // useMemoize() allows any number of memoization.

      const activitiesWithRenderer = [];
      let nextVisibleActivity;

      for (let index = activities.length - 1; index >= 0; index--) {
        const activity = activities[index];
        const entry = createActivityRendererAndActivityStatusRendererMemoized(activity, nextVisibleActivity);

        if (entry) {
          activitiesWithRenderer.unshift(entry);

          nextVisibleActivity = activity;
        }
      }

      return activitiesWithRenderer;
    },
    [activities]
  );

  const context = useMemo(
    () => ({
      activities,
      activitiesWithRenderer,
      autoReturnReadReceipts,
      setAutoReturnReadReceipts: sendReadReceipt && setAutoReturnReadReceipts
    }),
    [activities, activitiesWithRenderer, autoReturnReadReceipts, sendReadReceipt, setAutoReturnReadReceipts]
  );

  return <WebChatActivitiesContext.Provider value={context}>{children}</WebChatActivitiesContext.Provider>;
};

ActivitiesComposer.defaultProps = {
  activities: undefined,
  children: undefined,
  sendReadReceipt: undefined
};

ActivitiesComposer.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      channelData: PropTypes.shape({
        'webchat:read-at': PropTypes.objectOf(PropTypes.oneOfType([PropTypes.bool, PropTypes.number]))
      })
    })
  ),
  children: PropTypes.any,
  sendReadReceipt: PropTypes.func
};

export default ActivitiesComposer;
