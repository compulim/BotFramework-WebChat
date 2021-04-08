/* eslint no-magic-numbers: ["error", { "ignore": [0, -1] }] */

import updateIn from 'simple-update-in';

import { DELETE_ACTIVITY } from '../actions/deleteActivity';
import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { MARK_ACTIVITY } from '../actions/markActivity';

import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING, POST_ACTIVITY_REJECTED } from '../actions/postActivity';

import getMetadata from '../utils/getMetadata';
import updateMetadata from '../utils/updateMetadata';

const DEFAULT_STATE = [];
const DIRECT_LINE_PLACEHOLDER_URL =
  'https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png';

function getClientActivityID({ channelData: { clientActivityID } = {} }) {
  return clientActivityID;
}

function findByClientActivityID(clientActivityID) {
  return activity => getClientActivityID(activity) === clientActivityID;
}

function patchActivity(activity) {
  // Direct Line channel will return a placeholder image for the user-uploaded image.
  // As observed, the URL for the placeholder image is https://docs.botframework.com/static/devportal/client/images/bot-framework-default-placeholder.png.
  // To make our code simpler, we are removing the value if "contentUrl" is pointing to a placeholder image.

  // TODO: [P2] #2869 This "contentURL" removal code should be moved to DirectLineJS adapter.

  // Also, if the "contentURL" starts with "blob:", this means the user is uploading a file (the URL is constructed by URL.createObjectURL)
  // Although the copy/reference of the file is temporary in-memory, to make the UX consistent across page refresh, we do not allow the user to re-download the file either.

  activity = updateIn(activity, ['attachments', () => true, 'contentUrl'], contentUrl => {
    if (contentUrl !== DIRECT_LINE_PLACEHOLDER_URL && !/^blob:/iu.test(contentUrl)) {
      return contentUrl;
    }
  });

  // Add "channelData['webchat:sender:who']" based on "activity.from.role".

  const {
    from: { role }
  } = activity;

  activity = updateMetadata(activity, { who: role === 'user' ? 'self' : role === 'channel' ? 'service' : 'others' });

  // Add "channelData['webchat:key']" based on coalesce of "activity.channelData.clientActivityId" and "activity.id".

  const { channelData: { clientActivityID } = {}, id } = activity;

  activity = updateMetadata(activity, { key: clientActivityID || id });

  return activity;
}

function upsertActivityWithSort(activities, nextActivity) {
  nextActivity = patchActivity(nextActivity);

  const { channelData: { clientActivityID: nextClientActivityID } = {} } = nextActivity;

  const nextTimestamp = Date.parse(nextActivity.timestamp);
  const nextActivities = activities.filter(
    ({ channelData: { clientActivityID } = {}, id }) =>
      // We will remove all "sending messages" activities and activities with same ID
      // "clientActivityID" is unique and used to track if the message has been sent and echoed back from the server
      !(nextClientActivityID && clientActivityID === nextClientActivityID) && !(id && id === nextActivity.id)
  );

  // Then, find the right (sorted) place to insert the new activity at, based on timestamp
  // Since clockskew might happen, we will ignore timestamp on messages that are sending

  const indexToInsert = nextActivities.findIndex(activity => {
    const { deliveryStatus } = getMetadata(activity);

    return Date.parse(activity.timestamp) > nextTimestamp && deliveryStatus !== 'sending' && deliveryStatus !== 'error';
  });

  // If no right place are found, append it
  nextActivities.splice(~indexToInsert ? indexToInsert : nextActivities.length, 0, nextActivity);

  return nextActivities;
}

export default function activities(state = DEFAULT_STATE, { meta, payload, type }) {
  switch (type) {
    case DELETE_ACTIVITY:
      state = updateIn(state, [({ id }) => id === payload.activityID]);
      break;

    case MARK_ACTIVITY:
      state = updateIn(
        state,
        [({ id }) => id === payload.activityID, 'channelData', payload.name],
        () => payload.value
      );
      break;

    case POST_ACTIVITY_PENDING:
      state = upsertActivityWithSort(state, updateMetadata(payload.activity, { deliveryStatus: 'sending' }));
      break;

    case POST_ACTIVITY_REJECTED:
      // TODO: Move from "clientActivityID" to "trackingNumber".
      state = updateIn(state, [findByClientActivityID(meta.clientActivityID)], activity =>
        updateMetadata(activity, { deliveryStatus: 'error' })
      );
      break;

    case POST_ACTIVITY_FULFILLED:
      state = updateIn(state, [findByClientActivityID(meta.clientActivityID)], () =>
        // We will replace the activity with the version from the server
        updateMetadata(patchActivity(payload.activity), { deliveryStatus: 'sent' })
      );

      break;

    case INCOMING_ACTIVITY:
      // TODO: [P4] #2100 Move "typing" into Constants.ActivityType
      state = upsertActivityWithSort(state, payload.activity);
      break;

    default:
      break;
  }

  return state;
}
