import { useSubscribeTypingNotification } from '@azure/acs-ui-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AbortController from 'abort-controller-es5';
import updateIn from 'simple-update-in';

import createDebug from '../utils/debug';

const MAXIMUM_TYPING_INTERVAL_IN_MILLISECONDS = 10000;
const MINIMUM_TYPING_INTERVAL_IN_MILLISECONDS = 8000;

let debug;
let EMPTY_ARRAY;
let PASSTHRU_FN;

type TypingUsers = {
  [userId: string]: number;
};

// TODO: Refactor into a composer.
export default function useACSTypingUsers(): [string[]] {
  debug || (debug = createDebug('useACSTypingUsers', { backgroundColor: 'cyan', color: 'black' }));
  EMPTY_ARRAY || (EMPTY_ARRAY = []);
  PASSTHRU_FN || (PASSTHRU_FN = value => value);

  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const [typingUserIds, setTypingUserIds] = useState<TypingUsers>({});
  const typingUserIdsForCallbacksRef = useRef<TypingUsers>();

  typingUserIdsForCallbacksRef.current = typingUserIds;

  const handleTypingNotification = useCallback(
    ({ from, originalArrivalTime }) => {
      debug([`Got typing notification for ${from}`], [{ from, originalArrivalTime }]);

      if (
        abortController.signal.aborted ||
        Date.now() - originalArrivalTime > MINIMUM_TYPING_INTERVAL_IN_MILLISECONDS
      ) {
        debug(0);

        return;
      }

      const nextTypingUserIds = updateIn(typingUserIdsForCallbacksRef.current, [from], () => originalArrivalTime);

      nextTypingUserIds === typingUserIdsForCallbacksRef.current || setTypingUserIds(nextTypingUserIds);
    },
    [abortController, setTypingUserIds]
  );

  useSubscribeTypingNotification(handleTypingNotification);

  const cleanupAt = Math.min(...Object.values(typingUserIds)) + MAXIMUM_TYPING_INTERVAL_IN_MILLISECONDS;

  useEffect(() => {
    // If there are no "typingUserIds", "cleanupAt" will be Infinity.
    if (!isFinite(cleanupAt)) {
      return;
    }

    const timeout = setTimeout(() => {
      const now = Date.now();
      let { current: nextTypingUserIds } = typingUserIdsForCallbacksRef;

      const userIdsWithExpiredTyping = Object.keys(nextTypingUserIds).filter(
        userId => now > nextTypingUserIds[userId] + MINIMUM_TYPING_INTERVAL_IN_MILLISECONDS
      );

      nextTypingUserIds = updateIn(nextTypingUserIds, [
        (_, userId: string) => userIdsWithExpiredTyping.includes(userId)
      ]);

      nextTypingUserIds === typingUserIdsForCallbacksRef.current || setTypingUserIds(nextTypingUserIds);
    }, Math.max(0, cleanupAt - Date.now()));

    return () => clearTimeout(timeout);
  }, [cleanupAt, setTypingUserIds, typingUserIdsForCallbacksRef]);

  return useMemo(() => [Object.keys(typingUserIds)], [typingUserIds]);
}
