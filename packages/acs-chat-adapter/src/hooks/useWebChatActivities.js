import { useMemo, useRef } from 'react';

import arrayEquals from '../util/arrayEquals';
import createACSMessageToWebChatActivityConverter from '../util/createACSMessageToWebChatActivityConverter';
import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useACSChatMessagesWithFetchAndSubscribe from './useACSChatMessagesWithFetchAndSubscribe';
import useACSReadReceiptsWithFetchAndSubscribe from './useACSReadReceiptsWithFetchAndSubscribe';
import useACSUserId from './useACSUserId';
import useDebugDeps from './useDebugDeps';

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

  const activitiesCachedRef = useRef();
  const activitiesCacheRef = useRef([]);
  const activitiesRef = useRef([]);
  const debugMemoizedRef = useRef();

  activitiesCachedRef.current = true;
  debugMemoizedRef.current = true;

  useDebugDeps(
    { acsChatMessages, acsReadReceipts, activitiesCacheRef, activitiesRef, readOnByUserIds },
    'useWebChatActivities:2'
  );

  const { nextActivities, nextActivitiesCache } = useMemo(() => {
    debugMemoizedRef.current = false;

    // Perf: caching current accessor
    const { current: activities } = activitiesRef;
    const { current: activitiesCache } = activitiesCacheRef;

    const nextActivities = [];
    const nextActivitiesCache = [];

    acsChatMessages.forEach((acsChatMessage, index) => {
      const { createdOn } = acsChatMessage;

      const userReads = Object.entries(readOnByUserIds)
        .filter(([_, readOn]) => readOn >= createdOn)
        .map(([userId]) => userId)
        .sort();

      const cache = activitiesCache[index];

      if (cache && cache.acsChatMessage === acsChatMessage && arrayEquals(cache.userReads, userReads)) {
        nextActivitiesCache.push(cache);
        nextActivities.push(activities[index]);

        return;
      }

      activitiesCachedRef.current = false;

      const lastIndex = activitiesCache.findIndex(
        cache => cache.acsChatMessage === acsChatMessage && arrayEquals(cache.userReads, userReads)
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

    return { nextActivities, nextActivitiesCache };
  }, [acsChatMessages, acsMessageToWebChatActivity, activitiesCacheRef, activitiesRef, readOnByUserIds]);

  if (debugMemoizedRef.current) {
    // debug('Activities memoize %chit%c', ...styleConsole('green', 'white'));
  } else if (activitiesCachedRef.current) {
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
          activities: activitiesRef.current,
          activitiesCache: activitiesCacheRef.current,
          nextActivities,
          nextActivitiesCache
        }
      ]
    );
  } else {
    // The input array has changed and we updated our output.
    debug('Activities not memoized and %ccache miss%c', ...styleConsole('green'));
  }

  activitiesCacheRef.current = nextActivitiesCache;
  activitiesRef.current = nextActivities;

  const { current: activities } = activitiesRef.current;

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
