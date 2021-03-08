import { EMIT_TYPING_INDICATOR } from '../actions/emitTypingIndicator';
import createDebug from '../../util/debug';

let debug;

export default function createEmitTypingIndicatorMiddleware({ sendTypingNotification }) {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('mw:emitTypingIndicator', { backgroundColor: 'orange', color: 'black' }));

  return () => next => action => {
    if (action.type === EMIT_TYPING_INDICATOR) {
      debug('sending typing notification');
      sendTypingNotification();
    }

    return next(action);
  };
}
