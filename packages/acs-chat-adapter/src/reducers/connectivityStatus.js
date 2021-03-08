// TODO: We may want to rework this one on Web Chat side:
//       - "connectingslow" is part of logic on Web Chat side
//       - Instead of "reconnecting", consider "connecting" + connect count

import { CONNECT_FULFILLED, CONNECT_PENDING, CONNECT_REJECTED } from '../actions/connect';

import { RECONNECT_PENDING, RECONNECT_FULFILLED } from '../actions/reconnect';

import { DISCONNECT_FULFILLED } from '../actions/disconnect';

export default function connectivityStatus(state = 'uninitialized', { type, meta }) {
  switch (type) {
    case CONNECT_PENDING:
    case RECONNECT_PENDING:
      if (state !== 'uninitialized') {
        state = 'reconnecting';
      }

      break;

    case CONNECT_FULFILLED:
      state = 'connected';
      break;

    case RECONNECT_FULFILLED:
      state = 'reconnected';
      break;

    case CONNECT_REJECTED:
      state = 'error';
      break;

    case DISCONNECT_FULFILLED:
      state = meta && meta.error ? 'error' : 'notconnected';
      break;

    default:
      break;
  }

  return state;
}
