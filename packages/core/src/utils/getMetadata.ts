import Activity from '../types/Activity';
import ActivityMetadata from '../types/ActivityMetadata';
import warn from './warn';

export default function getMetadata(activity?: Activity): ActivityMetadata {
  if (!activity) {
    return;
  }

  const {
    channelData: {
      clientActivityID: clientActivityId,
      'webchat:delivery-status': deliveryStatus,
      'webchat:key': key,
      'webchat:read-by': readBy,
      'webchat:sender:image': imageFromActivity,
      'webchat:sender:initials': initialsFromActivity,
      'webchat:sender:name': senderName,
      'webchat:sender:who': who,
      'webchat:tracking-number': trackingNumber
    } = {},
    // TODO: Remove "from".
    from: { role } = {},
    id
  } = activity;

  if (!activity.channelData) {
    warn('"channelData" must be set.');
  }

  if (!key) {
    warn('"key" must be set.');
  }

  return {
    avatarImage: imageFromActivity,
    avatarInitials: initialsFromActivity,
    deliveryStatus,
    // TODO: Deprecate this.
    key: key || clientActivityId || id,
    readBy,
    senderName,
    trackingNumber,
    // TODO: Deprecate this.
    who: who || (role === 'user' ? 'self' : 'others')
  };
}
