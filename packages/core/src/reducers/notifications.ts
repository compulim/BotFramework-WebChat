import updateIn from 'simple-update-in';

import { CONNECT_FULFILLED, CONNECT_PENDING, CONNECT_REJECTED, CONNECT_STILL_PENDING } from '../actions/connect';
import { RECONNECT_PENDING, RECONNECT_FULFILLED } from '../actions/reconnect';
import { SAGA_ERROR } from '../actions/sagaError';
import Notifications from '../types/Notifications';

const DEFAULT_STATE: Notifications = {};

// TODO: Compare this logic vs. old logic.
export default function notifications(state = DEFAULT_STATE, { type }) {
  if (type === CONNECT_PENDING || type === CONNECT_STILL_PENDING || type === RECONNECT_PENDING) {
    state = updateIn(state, ['connectivitystatus', 'data'], () => 'connecting');
  } else if (type === CONNECT_FULFILLED || type === RECONNECT_FULFILLED) {
    state = updateIn(state, ['connectivitystatus', 'data'], () => 'connected');
  } else if (type === CONNECT_REJECTED || type === SAGA_ERROR) {
    state = updateIn(state, ['connectivitystatus', 'data'], () => 'fatal');
  }

  // If it is the first time the connectivity status notification updated, we should set the "id" field too.
  if (state !== DEFAULT_STATE) {
    state = updateIn(state, ['connectivitystatus', 'id'], () => 'connectivitystatus');
  }

  return state;
}

// import updateIn from 'simple-update-in';

// import { DISMISS_NOTIFICATION } from '../actions/dismissNotification';
// import { SAGA_ERROR } from '../actions/sagaError';
// import { SET_NOTIFICATION } from '../actions/setNotification';

// const DEFAULT_STATE = {};

// export default function notifications(state = DEFAULT_STATE, { payload, type }) {
//   const now = Date.now();

//   if (type === DISMISS_NOTIFICATION) {
//     state = updateIn(state, [payload.id]);
//   } else if (type === SAGA_ERROR) {
//     state = updateIn(state, ['connectivitystatus', 'data'], () => 'javascripterror');
//   } else if (type === SET_NOTIFICATION) {
//     const { alt, data, id, level, message } = payload;
//     const notification = state[id];

//     if (
//       !notification ||
//       alt !== notification.alt ||
//       !Object.is(data, notification.data) ||
//       level !== notification.level ||
//       message !== notification.message
//     ) {
//       state = updateIn(state, [id], () => ({
//         alt,
//         data,
//         id,
//         level,
//         message,
//         timestamp: now
//       }));
//     }
//   }

//   return state;
// }
