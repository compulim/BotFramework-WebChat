import { POST_ACTIVITY } from '../actions/postActivity';
import createDebug from '../../util/debug';

let debug;

export default function createPostActivityMiddleware({ sendMessage }) {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('mw:postActivity', { backgroundColor: 'orange', color: 'white' }));

  return () => next => action => {
    if (action.type === POST_ACTIVITY) {
      (async function () {
        const { text, type } = action.payload.activity;

        if (type === 'message') {
          const now = Date.now();

          debug(`Sending message "${text}".`);

          await sendMessage(text);

          debug(`Message sent, took ${Date.now() - now} ms.`);
        }
      })();
    }

    return next(action);
  };
}
