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

function findByTrackingNumber(trackingNumber) {
  return activity => getMetadata(activity).trackingNumber === trackingNumber;
}

// Activity is from server and may requires normalization.
function normalizeActivityFromServer(activity) {
  // Make sure every activity has "attachments" and "channelData".
  activity = updateIn(activity, ['attachments'], attachments => (Array.isArray(attachments) ? attachments : []));
  activity = updateIn(activity, ['channelData'], channelData => channelData || {});

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

  return activity;
}

function upsertActivityWithSort(activities, nextActivity) {
  const { trackingNumber: nextTrackingNumber } = getMetadata(nextActivity);

  const nextTimestamp = Date.parse(nextActivity.timestamp);
  const nextActivities = activities.filter(activity => {
    // We will remove all "sending messages" activities and activities with same ID
    // "trackingNumber" is unique and used to track if the message has been sent and echoed back from the server

    const { id } = activity;
    const { trackingNumber } = getMetadata(activity);

    return !(nextTrackingNumber && trackingNumber === nextTrackingNumber) && !(id && id === nextActivity.id);
  });

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
      {
        let activity = normalizeActivityFromServer(payload.activity);

        activity = updateMetadata(activity, { deliveryStatus: 'sending' });

        state = upsertActivityWithSort(state, activity);
      }

      break;

    case POST_ACTIVITY_REJECTED:
      state = updateIn(state, [findByTrackingNumber(meta.trackingNumber)], activity => {
        activity = updateMetadata(activity, { deliveryStatus: 'error' });

        return activity;
      });

      break;

    case POST_ACTIVITY_FULFILLED:
      {
        let activity = normalizeActivityFromServer(payload.activity);

        activity = updateMetadata(activity, { deliveryStatus: undefined });

        // We will replace the activity with the version from the server
        state = updateIn(state, [findByTrackingNumber(meta.trackingNumber)], () => activity);
      }

      break;

    case INCOMING_ACTIVITY:
      state = upsertActivityWithSort(state, normalizeActivityFromServer(payload.activity));

      break;

    default:
      break;
  }

  return state;
}
