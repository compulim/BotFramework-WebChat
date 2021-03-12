import { useCallback, useRef } from 'react';

import createDebug from '../utils/debug';
import getActivityKey from '../utils/getActivityKey';
import useActivities from './useActivities';
import useLastAcknowledgedActivityKey from './internal/useLastAcknowledgedActivityKey';

let debug;

export default function useAcknowledgeActivity() {
  debug || (debug = createDebug('util:useAcknowledgeActivity', { backgroundColor: 'lightgray', color: 'black' }));

  const [activities] = useActivities();
  const [_, setLastAcknowledgedActivityKey] = useLastAcknowledgedActivityKey();

  // Perf: decoupling activities from callback
  const activitiesRef = useRef();

  activitiesRef.current = activities;

  return useCallback(
    activity => {
      const activityKey = getActivityKey(activity);

      debug([`Acknowledging activity with key "${activityKey}"`], [{ activity }]);

      // Verify the acknowledging activity must be in the transcript.

      setLastAcknowledgedActivityKey(prevLastAcknowledgedActivityKey => {
        const { current: activities } = activitiesRef;

        const index = activities.indexOf(activity);

        if (!~index) {
          console.warn(
            'botframework-webchat: the activity passed to useAcknowledgeActivity() must be present in the transcript.'
          );

          return prevLastAcknowledgedActivityKey;
        }

        const prevIndex = activities.findIndex(
          activity => getActivityKey(activity) === prevLastAcknowledgedActivityKey
        );

        if (prevIndex > index) {
          console.warn(
            'botframework-webchat: the activity passed to useAcknowledgeActivity() must be later than the previously acknowledge activity'
          );

          return prevLastAcknowledgedActivityKey;
        }

        return activityKey;
      });
    },
    [activitiesRef, setLastAcknowledgedActivityKey]
  );
}
