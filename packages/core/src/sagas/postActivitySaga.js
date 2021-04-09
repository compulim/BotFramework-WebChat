import { all, call, cancelled, put, race, select, take, takeEvery } from 'redux-saga/effects';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../actions/postActivity';
import clockSkewAdjustmentSelector from '../selectors/clockSkewAdjustment';
import combineSelectors from '../selectors/combineSelectors';
import deleteKey from '../utils/deleteKey';
import getMetadata from '../utils/getMetadata';
import languageSelector from '../selectors/language';
import observeOnce from './effects/observeOnce';
import sleep from '../utils/sleep';
import uniqueID from '../utils/uniqueID';
import updateMetadata from '../utils/updateMetadata';
import whileConnected from './effects/whileConnected';

const SEND_TIMEOUT = 120000;

function getTimestamp(clockSkewAdjustment = 0) {
  return new Date(Date.now() + clockSkewAdjustment).toISOString();
}

function* postActivity(directLine, userID, username, numActivitiesPosted, { meta: { method }, payload: activity }) {
  const { clockSkewAdjustment, locale } = yield select(
    combineSelectors({ clockSkewAdjustment: clockSkewAdjustmentSelector, locale: languageSelector })
  );
  const { attachments } = activity;
  const trackingNumber = uniqueID();

  activity = updateMetadata(activity, {
    deliveryStatus: 'sending',
    key: trackingNumber,
    trackingNumber,
    who: 'self'
  });

  activity = {
    ...deleteKey(activity, 'id'),
    attachments:
      attachments &&
      attachments.map(({ contentType, contentUrl, name, thumbnailUrl }) => ({
        contentType,
        contentUrl,
        name,
        thumbnailUrl
      })),
    channelData: {
      ...deleteKey(activity.channelData, 'state'),
      // This is unskewed local timestamp for estimating clock skew.
      // TODO: Rename "clientTimestamp" to "webchat:client-timestamp".
      clientTimestamp: getTimestamp()
    },
    channelId: 'webchat',
    from: {
      id: userID,
      name: username,
      role: 'user'
    },
    locale,
    // This timestamp will be replaced by Direct Line Channel in echoback.
    // We are temporarily adding this timestamp for sorting.
    timestamp: getTimestamp(clockSkewAdjustment)
  };

  if (!numActivitiesPosted) {
    activity.entities = [
      ...(activity.entities || []),
      {
        // TODO: [P4] Currently in v3, we send the capabilities although the client might not actually have them
        //       We need to understand why we need to send these, and only send capabilities the client have
        requiresBotState: true,
        supportsListening: true,
        supportsTts: true,
        type: 'ClientCapabilities'
      }
    ];
  }

  const meta = { method, trackingNumber };

  yield put({ type: POST_ACTIVITY_PENDING, meta, payload: { activity } });

  try {
    // Quirks: We might receive INCOMING_ACTIVITY before the postActivity call completed
    //         So, we setup expectation first, then postActivity afterward

    const echoBackCall = call(function* () {
      for (;;) {
        const {
          payload: { activity }
        } = yield take(INCOMING_ACTIVITY);
        if (getMetadata(activity).trackingNumber === trackingNumber && activity.id) {
          return updateMetadata(activity, { deliveryStatus: 'sent' });
        }
      }
    });

    // Timeout could be due to either:
    // - Post activity call may take too long time to complete
    //   - Direct Line service only respond on HTTP after bot respond to Direct Line
    // - Activity may take too long time to echo back

    const {
      send: { echoBack }
    } = yield race({
      send: all({
        echoBack: echoBackCall,
        // TODO: Should we remove most Web Chat-specific channelData except "webchat:tracking-number"?
        postActivity: observeOnce(directLine.postActivity(activity))
      }),
      timeout: call(() => sleep(SEND_TIMEOUT).then(() => Promise.reject(new Error('timeout'))))
    });

    yield put({ type: POST_ACTIVITY_FULFILLED, meta, payload: { activity: echoBack } });
  } catch (err) {
    console.error('botframework-webchat: Failed to post activity to chat adapter.', err);

    yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: err });
  } finally {
    if (yield cancelled()) {
      yield put({ type: POST_ACTIVITY_REJECTED, error: true, meta, payload: new Error('cancelled') });
    }
  }
}

export default function* postActivitySaga() {
  yield whileConnected(function* postActivityWhileConnected({ directLine, userID, username }) {
    let numActivitiesPosted = 0;

    yield takeEvery(POST_ACTIVITY, function* postActivityWrapper(action) {
      yield* postActivity(directLine, userID, username, numActivitiesPosted++, action);
    });
  });
}
