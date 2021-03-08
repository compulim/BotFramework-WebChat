// TODO: We should throw away this action. Web Chat should directly send ACTIVITY.
import { POST_ACTIVITY } from '../actions/postActivity';
import { SET_SEND_BOX } from '../actions/setSendBox';
import { SUBMIT_SEND_BOX } from '../actions/submitSendBox';

export default function createSubmitSendBoxMiddleware() {
  return ({ dispatch, getState }) => next => action => {
    if (action.type === SUBMIT_SEND_BOX) {
      const { sendBoxValue } = getState();

      dispatch({
        payload: {
          activity: {
            text: sendBoxValue,
            type: 'message'
          }
        },
        type: POST_ACTIVITY
      });

      dispatch({
        payload: {
          text: ''
        },
        type: SET_SEND_BOX
      });
    }

    return next(action);
  };
}
