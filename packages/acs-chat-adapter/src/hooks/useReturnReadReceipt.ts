import { useCallback } from 'react';

import { WebChatActivity } from '../types/WebChatActivity';

import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useACSSendReadReceipt from './useACSSendReadReceipt';
import warn from '../util/warn';

let debug;

export default function useReturnReadReceipt(): (activity: WebChatActivity) => void {
  debug || (debug = createDebug('acs:useReturnReadReceipt'));

  const acsSendReadReceipt = useACSSendReadReceipt();

  return useCallback(
    (activity: WebChatActivity): void => {
      const { channelData: { 'acs:chat-message': acsChatMessage, 'webchat:who': who } = {} } = activity;

      if (!acsChatMessage) {
        debug(['Cannot return read receipt for non-ACS message.'], [{ acsChatMessage, who }]);

        warn('Cannot return read receipt for non-ACS message.');
      } else if (!acsChatMessage.id) {
        warn('Cannot return read receipt for an outgoing message.', [{ acsChatMessage, who }]);
      } else if (who !== 'others') {
        warn('Cannot return read receipt for a message from "channel" or "self".', [{ acsChatMessage, who }]);
      } else {
        const { id: acsChatMessageId } = acsChatMessage;
        const now = Date.now();

        // We ignore if the read receipt is successfully sent or not (in an async fashion).
        /* eslint-disable-next-line require-await */
        acsSendReadReceipt(acsChatMessageId);

        debug(
          [
            `Read receipt returned for message %c${acsChatMessageId}%c, took %c${Date.now() - now} ms%c.`,
            ...styleConsole('purple'),
            ...styleConsole('green')
          ],
          [{ acsChatMessage, acsChatMessageId, activity }]
        );
      }
    },
    [acsSendReadReceipt]
  );
}
