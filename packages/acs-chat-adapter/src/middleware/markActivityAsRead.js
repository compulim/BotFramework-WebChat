import { MARK_ACTIVITY_AS_READ } from '../actions/markActivityAsRead';
import createDebug from '../../util/debug';

let debug;

export default function createMarkActivityAsReadMiddleware({ sendReadReceipt }) {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('mw:markActivityAsRead', { backgroundColor: 'orange', color: 'white' }));

  return () => next => action => {
    if (action.type === MARK_ACTIVITY_AS_READ) {
      // eslint-disable-next-line wrap-iife
      (async function () {
        const { channelData: { 'acs:chat-message': acsChatMessage, 'webchat:who': who } = {} } = action.payload;

        if (!acsChatMessage) {
          debug(['Cannot mark a non-ACS message as read.'], [{ acsChatMessage, who }]);

          console.warn('acs-chat-adapter: Cannot mark a non-ACS message as read.');
        } else if (!acsChatMessage.id) {
          console.warn('acs-chat-adapter: Cannot mark a sending message as read.', [{ acsChatMessage, who }]);
        } else if (who !== 'others') {
          console.warn('acs-chat-adapter: Cannot mark a message from "channel" or "self" as read.', [
            { acsChatMessage, who }
          ]);
        } else {
          const { id: acsChatMessageId } = acsChatMessage;
          const now = Date.now();

          await sendReadReceipt(acsChatMessageId);

          debug(
            [`Read receipt sent for message with ID "${acsChatMessageId}", took ${Date.now() - now} ms.`],
            [{ activity: action.payload, acsChatMessage, acsChatMessageId }]
          );
        }
      })();
    }

    return next(action);
  };
}
