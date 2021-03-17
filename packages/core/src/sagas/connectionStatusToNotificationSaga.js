/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 3, 4] }] */

import { call, put, takeLatest } from 'redux-saga/effects';

import { CONNECT } from '../actions/connect';
import createPromiseQueue from '../createPromiseQueue';
import setNotification from '../actions/setNotification';

const CONNECTIVITY_STATUS_NOTIFICATION_ID = 'connectivitystatus';

function subscribeToPromiseQueue(observable) {
  const { push, shift } = createPromiseQueue();
  const subscription = observable.subscribe({ next: push });

  return {
    shift,
    unsubscribe() {
      subscription.unsubscribe();
    }
  };
}

function* connectionStatusToNotification({ payload: { directLine } }) {
  const { shift, unsubscribe } = subscribeToPromiseQueue(directLine.connectionStatus$);

  try {
    let reconnecting;

    for (;;) {
      const value = yield call(shift);

      switch (value) {
        case 0:
        case 1:
          yield put(
            setNotification({
              data: reconnecting ? 'reconnecting' : 'connecting',
              id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
              level: 'info'
            })
          );

          break;

        case 2:
          reconnecting = 1;

          yield put(
            setNotification({
              data: 'connected',
              id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
              level: 'success'
            })
          );

          break;

        case 3:
        case 4:
          reconnecting = 1;

          yield put(
            setNotification({
              data: 'fatal',
              id: CONNECTIVITY_STATUS_NOTIFICATION_ID,
              level: 'error'
            })
          );

          break;

        default:
          break;
      }
    }
  } finally {
    unsubscribe();
  }
}

export default function* () {
  yield takeLatest(CONNECT, connectionStatusToNotification);
}
