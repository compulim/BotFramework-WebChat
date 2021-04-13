import updateIn from 'simple-update-in';

import { SET_SEND_TIMEOUTS } from '../actions/setSendTimeouts';

const DEFAULT_STATE = { sendTimeout: 20000, sendTimeoutForAttachments: 120000 };

export default function sendTimeouts(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_SEND_TIMEOUTS:
      state = updateIn(state, ['sendTimeout'], () => payload.sendTimeout);
      state = updateIn(state, ['sendTimeoutForAttachments'], () => payload.sendTimeoutForAttachments);

      break;

    default:
      break;
  }

  return state;
}
