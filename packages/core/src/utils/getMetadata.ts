import Activity from '../types/Activity';
import DeliveryStatus from '../types/DeliveryStatus';
import ReadBy from '../types/ReadBy';
import warn from './warn';
import Who from '../types/Who';

export default function getMetadata(
  activity?: Activity
): {
  avatarImage?: string;
  avatarInitials?: string;
  deliveryStatus?: DeliveryStatus;
  key: string;
  readBy?: ReadBy;
  senderName?: string;
  trackingNumber?: string;
  who?: Who;
} {
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
