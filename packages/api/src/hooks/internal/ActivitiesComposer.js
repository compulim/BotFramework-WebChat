import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import createDebug from '../../utils/debug';
import getActivityKey from '../../utils/getActivityKey';
import useCreateActivityRenderer from '../useCreateActivityRenderer';
import useCreateActivityStatusRenderer from '../useCreateActivityStatusRenderer';
import useMemoAll from './useMemoAll';
import useMemoWithPrevious from './useMemoWithPrevious';
import warn from '../../utils/warn';
import WebChatActivitiesContext from './WebChatActivitiesContext';

let debug;

const ActivitiesComposer = ({ activities, children, honorReadReceipts, setHonorReadReceipts }) => {
  debug || (debug = createDebug('<ActivitiesComposer>', { backgroundColor: 'yellow', color: 'black' }));

  // Validate every activity
  useMemoWithPrevious(() => {
    activities.every(activity => activity) || warn('🔥🔥🔥 All activities must be present, no falsies.');

    activities.every(activity => activity.channelData) ||
      warn('🔥🔥🔥 All activities must have a property bag named "channelData".');

    activities.every(activity => activity.channelData['webchat:who']) ||
      warn(`🔥🔥🔥 All activities must have "channelData['webchat:who']" set.`);

    activities.every(getActivityKey) || warn('🔥🔥🔥 All activities must have a key.');

    activities.every(
      ({ channelData }) => !channelData['webchat:delivery-status'] || channelData['webchat:tracking-number']
    ) ||
      warn(
        `🔥🔥🔥 Activities which has "channelData['webchat:delivery-status']" must also set "channelData['webchat:tracking-number']".`
      );

    activities.every(
      ({ channelData }) => !channelData['webchat:tracking-number'] || channelData['webchat:delivery-status']
    ) ||
      warn(
        `🔥🔥🔥 Activities which has "channelData['webchat:tracking-number']" must also set "channelData['webchat:delivery-status']".`
      );

    // TODO: For accessibility, no activities can be inserted at start or in the midway

    // TODO: Add more validations

    return activities;
  }, [activities]);

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
      honorReadReceipts,
      setHonorReadReceipts
    }),
    [activities, activitiesWithRenderer, honorReadReceipts, setHonorReadReceipts]
  );

  return <WebChatActivitiesContext.Provider value={context}>{children}</WebChatActivitiesContext.Provider>;
};

ActivitiesComposer.defaultProps = {
  activities: undefined,
  children: undefined,
  honorReadReceipts: undefined,
  setHonorReadReceipts: undefined
};

ActivitiesComposer.propTypes = {
  activities: PropTypes.array,
  children: PropTypes.any,
  honorReadReceipts: PropTypes.bool,
  setHonorReadReceipts: PropTypes.func
};

export default ActivitiesComposer;
