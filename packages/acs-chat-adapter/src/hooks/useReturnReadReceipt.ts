import { useCallback, useRef } from 'react';

import { Activity } from '../types/Activity';

import createDebug from '../utils/debug';
import fromWho from '../utils/fromWho';
import getActivityKey from '../utils/getActivityKey';
import styleConsole from '../utils/styleConsole';
import useACSSendReadReceipt from './useACSSendReadReceipt';
import useActivities from './useActivities';
import warn from '../utils/warn';

let debug;

export default function useReturnReadReceipt(): (activityKey: string) => void {
  debug || (debug = createDebug('acs:useReturnReadReceipt'));

  const [activities] = useActivities();
  const acsSendReadReceipt = useACSSendReadReceipt();

  // Perf: decouple for callbacks

  const activitiesForCallbacksRef = useRef<Activity[]>();

  activitiesForCallbacksRef.current = activities;

  return useCallback(
    (activityKey: string): void => {
      const { current: activities } = activitiesForCallbacksRef;

      const activity = activities.find(activity => getActivityKey(activity) === activityKey);

      if (!activity) {
        warn(`Cannot find activity with key "${activityKey}".`);
      }

      const who = fromWho(activity);

      if (who !== 'others') {
        return warn('Cannot return read receipt for a message from "channel" or "self".', [{ who }]);
      }

      const { channelData: { 'acs:chat-message-id': acsChatMessageId } = {} } = activity;

      if (!acsChatMessageId) {
        debug(['Cannot return read receipt for non-ACS message.'], [{ activity }]);

        return warn('Cannot return read receipt for non-ACS message.');
      }

      // We ignore if the read receipt is successfully sent or not (in an async fashion).
      /* eslint-disable-next-line wrap-iife */
      (async function () {
        const now = Date.now();

        await acsSendReadReceipt(acsChatMessageId);

        debug(
          [
            `Read receipt returned for message %c${acsChatMessageId}%c, took %c${Date.now() - now} ms%c.`,
            ...styleConsole('purple'),
            ...styleConsole('green')
          ],
          [{ acsChatMessageId, activity }]
        );
      })();
    },
    [acsSendReadReceipt, activitiesForCallbacksRef]
  );
}
