import { put } from 'redux-saga/effects';
import updateIn from 'simple-update-in';

import getMetadata from '../utils/getMetadata';
import observeEach from './effects/observeEach';
import queueIncomingActivity from '../actions/queueIncomingActivity';
import updateMetadata from '../utils/updateMetadata';
import whileConnected from './effects/whileConnected';

const PASSTHRU_FN = value => value;

function patchActivityWithFromRole(activity, userID) {
  // Some activities, such as "ConversationUpdate", does not have "from" defined.
  // And although "role" is defined in Direct Line spec, it was not sent over the wire.
  // We normalize the activity here to simplify null-check and logic later.

  // Patch activity.from.role to make sure its either "bot", "user", or "channel"
  if (!activity.from) {
    activity = updateIn(activity, ['from', 'role'], () => 'channel');
  } else if (!activity.from.role) {
    if (activity.from.id === userID) {
      activity = updateIn(activity, ['from', 'role'], () => 'user');
    } else if (activity.from.id) {
      activity = updateIn(activity, ['from', 'role'], () => 'bot');
    } else {
      activity = updateIn(activity, ['from', 'role'], () => 'channel');
    }
  }

  return activity;
}

function patchNullAsUndefined(activity) {
  // These fields are known used in Web Chat and in any cases, they should not be null, but undefined.
  // The only field omitted is "value", as it could be null purposefully.

  return [
    'attachmentLayout',
    'attachments',
    'channelData',
    'conversation',
    'entities',
    'from',
    'inputHint',
    'locale',
    'name',
    'recipient',
    'speak',
    'suggestedActions',
    'text',
    'textFormat',
    'timestamp',
    'type'
  ].reduce((activity, name) => {
    const { [name]: value } = activity;

    return updateIn(activity, [name], typeof value === 'undefined' || value === null ? undefined : PASSTHRU_FN);
  }, activity);
}

function patchMetadata(activity) {
  const { from: { id: userIDFromActivity, name: usernameFromActivity, role } = {}, id: idFromActivity } = activity;
  // We can skip warning for getMetadata() because the activity just arrived from the network and is not patched yet.
  const { trackingNumber } = getMetadata(activity, true);

  const self = role === 'user';

  const key = self ? trackingNumber : idFromActivity;
  const who = self ? 'self' : 'others';

  // [NO-MULTIUSER] Based on the Direct Line protocol, we cannot know if the "activity.from" is another user or a bot.
  // Thus, we assume all activities not from us and does not have sender's name, is a bot.
  const senderName = !self && userIDFromActivity === usernameFromActivity ? '__BOT__' : usernameFromActivity;

  if (self && !trackingNumber) {
    throw new Error('[ASSERTION] botframework-webchat: "trackingNumber" must be set for all user activities.');
  } else if (!self && trackingNumber) {
    throw new Error('[ASSERTION] botframework-webchat: "trackingNumber" must NOT be set for all bot activities.');
  }

  return updateMetadata(activity, {
    key,
    senderName,
    who
  });
}

function* observeActivity({ directLine, userID }) {
  yield observeEach(directLine.activity$, function* observeActivity(activity) {
    // We are patching the activity in here as much as we could.
    // For things we cannot, such as, patch based on styleOptions, we will patch it later on.
    activity = patchNullAsUndefined(activity);
    activity = patchActivityWithFromRole(activity, userID);
    activity = patchMetadata(activity);

    yield put(queueIncomingActivity(activity));
  });
}

export default function* observeActivitySaga() {
  yield whileConnected(observeActivity);
}
