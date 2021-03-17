import { useCallback } from 'react';
import { useSendReadReceipt as useACSSendReadReceipt } from '@azure/acs-ui-sdk';

import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import warn from '../util/warn';

let debug;

export default function useSendReadReceipt() {
  debug || (debug = createDebug('acs:useSendReadReceipt'));

  const acsSendReadReceipt = useACSSendReadReceipt();

  return useCallback(
    async activity => {
      const { channelData: { 'acs:chat-message': acsChatMessage, 'webchat:who': who } = {} } = activity;

      if (!acsChatMessage) {
        debug(['Cannot send read receipt for non-ACS message.'], [{ acsChatMessage, who }]);

        warn('Cannot send read receipt for non-ACS message.');
      } else if (!acsChatMessage.id) {
        warn('Cannot send read receipt for an outgoing message.', [{ acsChatMessage, who }]);
      } else if (who !== 'others') {
        warn('Cannot send read receipt for a message from "channel" or "self".', [{ acsChatMessage, who }]);
      } else {
        const { id: acsChatMessageId } = acsChatMessage;
        const now = Date.now();

        await acsSendReadReceipt(acsChatMessageId);

        debug(
          [
            `Read receipt sent for message %c${acsChatMessageId}%c, took %c${Date.now() - now} ms%c.`,
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
