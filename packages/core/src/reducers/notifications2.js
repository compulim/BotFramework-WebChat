import updateIn from 'simple-update-in';

import { CONNECT_FULFILLED, CONNECT_PENDING, CONNECT_REJECTED, CONNECT_STILL_PENDING } from '../actions/connect';
import { RECONNECT_PENDING, RECONNECT_FULFILLED } from '../actions/reconnect';
import { SAGA_ERROR } from '../actions/sagaError';

const DEFAULT_STATE = {};

// TODO: Compare this logic vs. old logic.
export default function notifications(state = DEFAULT_STATE, { type }) {
  if (type === CONNECT_PENDING || type === CONNECT_STILL_PENDING || type === RECONNECT_PENDING) {
    state = updateIn(state, ['connectivitystatus', 'data'], () => 'connecting');
  } else if (type === CONNECT_FULFILLED || type === RECONNECT_FULFILLED) {
    state = updateIn(state, ['connectivitystatus', 'data'], () => 'connected');
  } else if (type === CONNECT_REJECTED || type === SAGA_ERROR) {
    state = updateIn(state, ['connectivitystatus', 'data'], () => 'fatal');
  }

  return state;
}
