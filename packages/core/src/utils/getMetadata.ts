import Activity from '../types/Activity';
import ActivityMetadata from '../types/ActivityMetadata';
import warn from './warn';

export default function getMetadata(activity: Activity, skipWarning?: boolean): ActivityMetadata {
  if (!activity) {
    return;
  }

  const {
    channelData: {
      'webchat:delivery-status': deliveryStatus,
      'webchat:key': key,
      'webchat:read-by': readBy,
      'webchat:sender:image': imageFromActivity,
      'webchat:sender:initials': initialsFromActivity,
      'webchat:sender:name': senderName,
      'webchat:sender:who': who,
      'webchat:tracking-number': trackingNumber
    } = {}
  } = activity;

  if (!skipWarning) {
    if (!activity.channelData) {
      warn('🔥🔥🔥 "channelData" must be set.', { activity });
    }

    if (!key) {
      warn('🔥🔥🔥 "key" must be set.', { activity });
    }
  }

  return {
    avatarImage: imageFromActivity,
    avatarInitials: initialsFromActivity,
    deliveryStatus,
    // TODO: Deprecate this.
    key,
    readBy,
    senderName,
    trackingNumber,
    // TODO: Deprecate this.
    who
  };
}
