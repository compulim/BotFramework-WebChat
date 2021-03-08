import { combineReducers } from 'redux';

import activities from './reducers/activities';
import connectivityStatus from './reducers/connectivityStatus';
import sendBoxValue from './reducers/sendBoxValue';
import typing from './reducers/typing';

function createDummyReducer(initialState) {
  return () => initialState;
}

export default function createReducer() {
  return combineReducers({
    activities,
    connectivityStatus,
    sendBoxValue,
    typing,

    clockSkewAdjustment: createDummyReducer(0),
    dictateInterims: createDummyReducer([]),
    dictateState: createDummyReducer(0),
    language: createDummyReducer('en'),
    notifications: createDummyReducer([]),
    readyState: createDummyReducer(0),
    referenceGrammarID: createDummyReducer(''),
    sendTimeout: createDummyReducer(30),
    sendTypingIndicator: createDummyReducer(true),
    shouldSpeakIncomingActivity: createDummyReducer(false),
    suggestedActions: createDummyReducer([])
  });
}
