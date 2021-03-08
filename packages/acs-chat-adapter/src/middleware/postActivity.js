import { POST_ACTIVITY } from '../actions/postActivity';
import createDebug from '../../util/debug';

let debug;

export default function createPostActivityMiddleware({ sendMessage }) {
  // Lazy initializing constants to save loading speed and memory
  debug || (debug = createDebug('mw:postActivity', { backgroundColor: 'orange', color: 'white' }));

  return () => next => action => {
    if (action.type === POST_ACTIVITY) {
      // eslint-disable-next-line wrap-iife
      (async function () {
        const { text, type } = action.payload;

        if (type === 'message') {
          const now = Date.now();

          debug(`Sending message "${text}".`);

          await sendMessage(text);

          debug(`Message sent, took ${Date.now() - now} ms.`);
        } else {
          console.warn(`chat-adapter-acs does not support activity of type ${type}`);
        }
      })();
    }

    return next(action);
  };
}
