import { useMemo } from 'react';

import createACSMessageToWebChatActivityConverter from '../util/createACSMessageToWebChatActivityConverter';
import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useACSChatMessagesWithFetchAndSubscribe from './useACSChatMessagesWithFetchAndSubscribe';
import useACSReadReceiptsWithFetchAndSubscribe from './useACSReadReceiptsWithFetchAndSubscribe';
import useACSUserId from './useACSUserId';
import useDebugDeps from './useDebugDeps';
import useMemoWithPrevious from './useMemoWithPrevious';

let debug;

export default function useWebChatActivities() {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('acs:useWebChatActivities', { backgroundColor: 'orange' }));

  debug('%cStart%c', ...styleConsole('cyan', 'black'));

  const acsChatMessages = useACSChatMessagesWithFetchAndSubscribe();
  const acsReadReceipts = useACSReadReceiptsWithFetchAndSubscribe();
  const userId = useACSUserId();

  useDebugDeps({ acsChatMessages, acsReadReceipts, userId }, 'useWebChatActivities:1');

  const acsMessageToWebChatActivity = useMemo(() => createACSMessageToWebChatActivityConverter({ identity: userId }), [
    userId
  ]);

  // Returns a map of user with their latest readOn date:
  // {
  //   "8:william": 1615641497834
  // }
  //
  // Note: the "chatMessageId" is not useful because:
  //       1. Read receipts is not sent for every message, only sent occasionally;
  //       2. We might not retrieve the whole transcript;
  //       3. Message can be deleted.
  //       Thus, we are using "readOn" > "createdOn" to check if a message is read or not.
  const readOnByUserIds = useMemo(
    () =>
      acsReadReceipts.reduce((readOnByUser, { readOn, sender: { communicationUserId } }) => {
        readOnByUser[communicationUserId] = Math.max(readOnByUser[communicationUserId] || 0, readOn);

        return readOnByUser;
      }, {}),
    [acsReadReceipts]
  );

  useDebugDeps({ acsChatMessages, acsReadReceipts, readOnByUserIds }, 'useWebChatActivities:2');

  const { activities } = useMemoWithPrevious(
    ({ activities, activitiesCache } = { activities: [], activitiesCache: [] }) => {
      let cached = true;
      let nextActivities = [];
      let nextActivitiesCache = [];

      acsChatMessages.forEach((acsChatMessage, index) => {
        const { createdOn } = acsChatMessage;

        const userReads = Object.entries(readOnByUserIds)
          .filter(([_, readOn]) => readOn >= createdOn)
          .map(([userId]) => userId)
          .sort();

        const activityCache = activitiesCache[index];

        if (
          activityCache &&
          Object.is(activityCache.acsChatMessage, acsChatMessage) &&
          Object.is(activityCache.userReads, userReads)
        ) {
          nextActivitiesCache.push(activityCache);
          nextActivities.push(activities[index]);

          return;
        }

        cached = false;

        const lastIndex = activitiesCache.findIndex(
          activityCache =>
            Object.is(activityCache.acsChatMessage, acsChatMessage) && Object.is(activityCache.userReads, userReads)
        );

        if (~lastIndex) {
          nextActivitiesCache.push(activitiesCache[lastIndex]);
          nextActivities.push(activities[lastIndex]);

          return;
        }

        const activity = acsMessageToWebChatActivity(
          acsChatMessage,
          Object.fromEntries(userReads.map(userId => [userId, true]))
        );

        nextActivitiesCache.push({ acsChatMessage, userReads });
        nextActivities.push(activity);
      });

      if (cached) {
        nextActivities = activities;
        nextActivitiesCache = activitiesCache;

        // Seeing this log line means performance issue in the input.
        // If the input is memoized correctly, we should not see this line.
        debug(
          [
            'Activities not memoized but %ccache hit%c, this is very likely %cwasted render%c',
            ...styleConsole('red'),
            ...styleConsole('red')
          ],
          [
            {
              acsChatMessages,
              from: {
                activities,
                activitiesCache
              },
              to: {
                activities: nextActivities,
                activitiesCache: nextActivitiesCache
              }
            }
          ]
        );
      } else {
        // The input array has changed and we updated our output.
        debug('Activities not memoized and %ccache miss%c', ...styleConsole('green'));
      }

      return { activities: nextActivities, activitiesCache: nextActivitiesCache };
    },
    [acsChatMessages, acsMessageToWebChatActivity, readOnByUserIds]
  );

  useMemo(
    () =>
      debug(
        [
          `Activities updated with %c${acsChatMessages.length} messages%c and %c${acsReadReceipts.length} read receipts%c.`,
          ...styleConsole('purple'),
          ...styleConsole('purple')
        ],
        [
          {
            acsChatMessages,
            acsReadReceipts,
            activities
          }
        ]
      ),
    [acsChatMessages, acsReadReceipts, activities]
  );

  useDebugDeps(
    {
      acsChatMessages,
      acsReadReceipts,
      activities,
      readOnByUserIds,
      userId
    },
    'useWebChatActivities:3'
  );

  debug('%cFinish%c', ...styleConsole('cyan', 'black'));

  return activities;
}
