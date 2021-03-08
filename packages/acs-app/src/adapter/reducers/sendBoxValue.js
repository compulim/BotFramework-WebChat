// TODO: We should remove this reducer.
//       The implementation should be done in Web Chat instead.
import { SET_SEND_BOX } from '../actions/setSendBox';

export default function sendBoxValue(state = '', { payload, type }) {
  switch (type) {
    case SET_SEND_BOX:
      state = payload.text;
      break;

    default:
      break;
  }

  return state;
}
