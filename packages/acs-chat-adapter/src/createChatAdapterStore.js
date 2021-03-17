import { applyMiddleware, createStore } from 'redux';

import createDebug from '../util/debug';
import createEmitTypingIndicatorMiddleware from './middleware/emitTypingIndicator';
import createReducer from './createReducer';
import createSendReadReceiptMiddleware from './middleware/sendReadReceipt';
import styleConsole from '../util/styleConsole';

let debug;

export default function createChatAdapterStore({ sendReadReceipt, sendTypingNotification, userId }) {
  debug || (debug = createDebug('acs:store', { backgroundColor: 'orange' }));

  return createStore(
    createReducer({ userId }),
    applyMiddleware(
      () => next => action => {
        debug([`Received action of type %c${action.type}%c`, ...styleConsole('purple')], [action]);

        return next(action);
      },
      createEmitTypingIndicatorMiddleware({ sendTypingNotification }),
      createSendReadReceiptMiddleware({ sendReadReceipt })
    )
  );
}
