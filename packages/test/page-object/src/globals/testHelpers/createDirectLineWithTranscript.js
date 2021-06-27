import Observable from 'core-js/features/observable';

import createDeferredObservable from '../../utils/createDeferredObservable';
import loadTranscriptAsset from '../../utils/loadTranscriptAsset';
import shareObservable from './shareObservable';

function updateRelativeTimestamp(now, activity) {
  if (typeof activity === 'string') {
    activity = {
      from: {
        id: 'bot',
        role: 'bot'
      },
      id: Math.random().toString(36).substr(2, 5),
      text: activity,
      timestamp: new Date(now).toISOString(),
      type: 'message'
    };
  }

  return {
    ...activity,

    ...(activity.from.role === 'user' &&
    activity.channelData &&
    (typeof activity.channelData.clientTimestamp === 'number' ||
      typeof activity.channelData.clientTimestamp === 'undefined')
      ? {
          channelData: {
            ...activity.channelData,
            clientTimestamp: new Date(now + (activity.channelData.clientTimestamp || 0)).toISOString()
          }
        }
      : {}),

    ...(typeof activity.timestamp === 'number' || typeof activity.timestamp === 'undefined'
      ? { timestamp: new Date(now + (activity.timestamp || 0)).toISOString() }
      : {})
  };
}

export default function createDirectLineWithTranscript(activitiesOrFilename, { overridePostActivity } = {}) {
  let now = Date.now();
  const patchActivity = (...args) => updateRelativeTimestamp(now++, ...args);
  const connectionStatusDeferredObservable = createDeferredObservable(() => {
    connectionStatusDeferredObservable.next(0);
  });

  const activityDeferredObservable = createDeferredObservable(() => {
    (async function () {
      connectionStatusDeferredObservable.next(1);
      connectionStatusDeferredObservable.next(2);

      const activities = (Array.isArray(activitiesOrFilename)
        ? activitiesOrFilename
        : await loadTranscriptAsset(activitiesOrFilename)
      ).map(patchActivity);

      setTimeout(() => {
        activities.forEach(activity => activityDeferredObservable.next(activity));
      }, 100);
    })();
  });

  return {
    activity$: shareObservable(activityDeferredObservable.observable),
    activityDeferredObservable: {
      ...activityDeferredObservable,

      next(activity) {
        return activityDeferredObservable.next(patchActivity(activity));
      }
    },
    connectionStatus$: shareObservable(connectionStatusDeferredObservable.observable),
    connectionStatusDeferredObservable,
    end: () => {},
    postActivity: activity => {
      if (overridePostActivity) {
        const result = overridePostActivity(activity);

        if (typeof result !== 'undefined') {
          return result;
        }
      }

      const id = Math.random().toString(36).substr(2, 5);

      activityDeferredObservable.next(
        patchActivity({
          ...activity,
          id
        })
      );

      return Observable.from([id]);
    }
  };
}
