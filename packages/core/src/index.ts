// import clearSuggestedActions from './actions/clearSuggestedActions';
import connect from './actions/connect';
import createStore, { withDevTools as createStoreWithDevTools } from './createStore';
import deprecation from './utils/deprecation';
import disconnect from './actions/disconnect';
import dismissNotification from './actions/dismissNotification';
import emitTypingIndicator from './actions/emitTypingIndicator';
// import markActivity from './actions/markActivity';
import postActivity from './actions/postActivity';
// import sendEvent from './actions/sendEvent';
// import sendFiles from './actions/sendFiles';
// import sendMessage from './actions/sendMessage';
// import sendMessageBack from './actions/sendMessageBack';
// import sendPostBack from './actions/sendPostBack';
// import setDictateInterims from './actions/setDictateInterims';
// import setDictateState from './actions/setDictateState';
// import setLanguage from './actions/setLanguage';
import setNotification from './actions/setNotification';
// import setSendBox from './actions/setSendBox';
// import setSendTimeout from './actions/setSendTimeout';
import setSendTimeouts from './actions/setSendTimeouts';
// import setSendTypingIndicator from './actions/setSendTypingIndicator';
// import startDictate from './actions/startDictate';
// import startSpeakingActivity from './actions/startSpeakingActivity';
// import stopDictate from './actions/stopDictate';
// import stopSpeakingActivity from './actions/stopSpeakingActivity';
// import submitSendBox from './actions/submitSendBox';

import * as ActivityClientState from './constants/ActivityClientState';
import * as DictateState from './constants/DictateState';

import Activity, { ActivityFromService, ActivityPropTypes, EventActivity, MessageActivity } from './types/Activity';
import ChatAdapter, { ChatAdapterPropTypes } from './types/ChatAdapter';
import ConnectivityStatus, { ConnectivityStatusPropTypes } from './types/ConnectivityStatus';
import DeliveryStatus, { DeliveryStatusPropTypes } from './types/DeliveryStatus';
import getMetadata from './utils/getMetadata';
import Notification, { NotificationPropTypes } from './types/Notification';
import Notifications, { NotificationsPropTypes } from './types/Notifications';
import ReadBy, { ReadByPropTypes } from './types/ReadBy';
import TextFormat, { TextFormatPropTypes } from './types/TextFormat';
import TypingUser, { TypingUserPropTypes } from './types/TypingUser';
import TypingUsers, { TypingUsersPropTypes } from './types/TypingUsers';
import updateMetadata from './utils/updateMetadata';
import warn from './utils/warn';
import Who, { WhoPropTypes } from './types/Who';

const Constants = { ActivityClientState, DictateState };
const PropTypes = {
  Activity: ActivityPropTypes,
  ChatAdapter: ChatAdapterPropTypes,
  ConnectivityStatus: ConnectivityStatusPropTypes,
  DeliveryStatus: DeliveryStatusPropTypes,
  Notification: NotificationPropTypes,
  Notifications: NotificationsPropTypes,
  ReadBy: ReadByPropTypes,
  TextFormat: TextFormatPropTypes,
  TypingUser: TypingUserPropTypes,
  TypingUsers: TypingUsersPropTypes,
  Who: WhoPropTypes
};
const version = process.env.npm_package_version;

export type {
  Activity,
  ActivityFromService,
  ChatAdapter,
  ConnectivityStatus,
  DeliveryStatus,
  EventActivity,
  MessageActivity,
  Notification,
  Notifications,
  ReadBy,
  TextFormat,
  TypingUser,
  TypingUsers,
  Who
};

export {
  // clearSuggestedActions,
  connect,
  Constants,
  createStore,
  createStoreWithDevTools,
  deprecation,
  disconnect,
  dismissNotification,
  emitTypingIndicator,
  getMetadata,
  // markActivity,
  PropTypes,
  postActivity,
  // sendEvent,
  // sendFiles,
  // sendMessage,
  // sendMessageBack,
  // sendPostBack,
  // setDictateInterims,
  // setDictateState,
  // setLanguage,
  setNotification,
  // setSendBox,
  // setSendTimeout,
  setSendTimeouts,
  // setSendTypingIndicator,
  // startDictate,
  // startSpeakingActivity,
  // stopDictate,
  // stopSpeakingActivity,
  // submitSendBox,
  updateMetadata,
  version,
  warn
};
