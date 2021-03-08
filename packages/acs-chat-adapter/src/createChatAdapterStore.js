import { applyMiddleware, createStore } from 'redux';

import createEmitTypingIndicatorMiddleware from './middleware/emitTypingIndicator';
import createPostActivityMiddleware from './middleware/postActivity';
import createReducer from './createReducer';
import createSubmitSendBoxMiddleware from './middleware/submitSendBox';

import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';

let debug;

export default function createChatAdapterStore({ sendMessage, sendTypingNotification }) {
  debug || (debug = createDebug('acs:store', { backgroundColor: 'orange', color: 'black' }));

  return createStore(
    createReducer(),
    applyMiddleware(
      createEmitTypingIndicatorMiddleware({ sendTypingNotification }),
      createPostActivityMiddleware({ sendMessage }),
      createSubmitSendBoxMiddleware(),
      () => next => action => {
        debug([`Received action of type %c${action.type}%c`, ...styleConsole('purple')], [action]);

        return next(action);
      }
    )
  );
}
