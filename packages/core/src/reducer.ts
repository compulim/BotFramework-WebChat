import { combineReducers } from 'redux';

import activities from './reducers/activities';
import chatAdapterDeprecationBridge from './reducers/chatAdapterDeprecationBridge';
import clockSkewAdjustment from './reducers/clockSkewAdjustment';
// import connectivityStatus from './reducers/connectivityStatus';
// import dictateInterims from './reducers/dictateInterims';
// import dictateState from './reducers/dictateState';
// import language from './reducers/language';
// import lastTypingAt from './reducers/lastTypingAt';
import notifications from './reducers/notifications';
// import readyState from './reducers/readyState';
import referenceGrammarID from './reducers/referenceGrammarID';
// import sendBoxValue from './reducers/sendBoxValue';
// import sendTimeout from './reducers/sendTimeout';
import sendTimeouts from './reducers/sendTimeouts';
// import sendTypingIndicator from './reducers/sendTypingIndicator';
// import shouldSpeakIncomingActivity from './reducers/shouldSpeakIncomingActivity';
// import suggestedActions from './reducers/suggestedActions';
import typing from './reducers/typing';
import user from './reducers/user';

export default combineReducers({
  activities,
  chatAdapterDeprecationBridge,
  clockSkewAdjustment,
  // connectivityStatus,
  // dictateInterims,
  // dictateState,
  // language,
  // lastTypingAt,
  notifications,
  // readyState,
  referenceGrammarID,
  // sendBoxValue,
  // sendTimeout,
  sendTimeouts,
  // sendTypingIndicator,
  // shouldSpeakIncomingActivity,
  // suggestedActions,
  typing,
  user
});
