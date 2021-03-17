import { put } from 'redux-saga/effects';

import observeEach from './effects/observeEach';
import setReferenceGrammarID from '../actions/setReferenceGrammarID';
import whileConnected from './effects/whileConnected';

function* observeConnectionStatus({ directLine }) {
  yield observeEach(directLine.connectionStatus$, function* updateConnectionStatus() {
    yield put(setReferenceGrammarID(directLine.referenceGrammarId));
  });
}

export default function* connectionStatusToReferenceGrammarIdSaga() {
  yield whileConnected(observeConnectionStatus);
}
