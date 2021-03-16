import { combineReducers } from 'redux';

import activities from './reducers/activities';
import connectivityStatus from './reducers/connectivityStatus';
import typing from './reducers/typing';
import userId from './reducers/userId';

function createDummyReducer(initialState) {
  return () => initialState;
}

export default function createReducer() {
  return combineReducers({
    activities,
    connectivityStatus,
    typing,
    userId,

    clockSkewAdjustment: createDummyReducer(0),
    dictateInterims: createDummyReducer([]),
    dictateState: createDummyReducer(0),
    language: createDummyReducer('en'),
    notifications: createDummyReducer([]),
    readyState: createDummyReducer(0),
    referenceGrammarID: createDummyReducer(''),
    // eslint-disable-next-line no-magic-numbers
    sendTimeout: createDummyReducer(30),
    sendTypingIndicator: createDummyReducer(true),
    shouldSpeakIncomingActivity: createDummyReducer(false),
    suggestedActions: createDummyReducer([])
  });
}
