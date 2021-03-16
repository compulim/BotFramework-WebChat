import { SEND_READ_RECEIPT } from '../actions/sendReadReceipt';
import createDebug from '../../util/debug';
import styleConsole from '../util/styleConsole';

let debug;

export default function createSendReadReceiptMiddleware({ sendReadReceipt }) {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('mw:sendReadReceipt', { backgroundColor: 'orange', color: 'white' }));

  return () => next => action => {
    if (action.type === SEND_READ_RECEIPT) {
      // eslint-disable-next-line wrap-iife
      (async function () {
        const { channelData: { 'acs:chat-message': acsChatMessage, 'webchat:who': who } = {} } = action.payload;

        if (!acsChatMessage) {
          debug(['Cannot send read receipt for non-ACS message.'], [{ acsChatMessage, who }]);

          console.warn('acs-chat-adapter: Cannot send read receipt for non-ACS message.');
        } else if (!acsChatMessage.id) {
          console.warn('acs-chat-adapter: Cannot send read receipt for an outgoing message.', [
            { acsChatMessage, who }
          ]);
        } else if (who !== 'others') {
          console.warn('acs-chat-adapter: Cannot send read receipt for a message from "channel" or "self".', [
            { acsChatMessage, who }
          ]);
        } else {
          const { id: acsChatMessageId } = acsChatMessage;
          const now = Date.now();

          await sendReadReceipt(acsChatMessageId);

          debug(
            [
              `Read receipt sent for message %c${acsChatMessageId}%c, took %c${Date.now() - now} ms%c.`,
              ...styleConsole('purple'),
              ...styleConsole('green')
            ],
            [{ activity: action.payload, acsChatMessage, acsChatMessageId }]
          );
        }
      })();
    }

    return next(action);
  };
}
