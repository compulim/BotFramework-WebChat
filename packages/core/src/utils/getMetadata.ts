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
      'webchat:message-back:display-text': messageBackDisplayText,
      'webchat:message:subtype': messageSubType,
      'webchat:key': key,
      'webchat:read-by': readBy,
      'webchat:sender:image': imageFromActivity,
      'webchat:sender:initials': initialsFromActivity,
      'webchat:sender:name': senderName,
      'webchat:sender:who': who,
      'webchat:tracking-number': trackingNumber
    } = {}
  } = activity;
  let { channelData: { 'webchat:attachment:sizes': attachmentSizes } = {} } = activity;

  if (!skipWarning) {
    if (!activity.channelData) {
      warn('🔥🔥🔥 "channelData" must be set.', { activity });
    }

    if (!key) {
      warn('🔥🔥🔥 "key" must be set.', { activity });
    }
  }

  if (
    attachmentSizes &&
    (!Array.isArray(attachmentSizes) ||
      !attachmentSizes.every(size => typeof size === 'number') ||
      attachmentSizes.length !== activity.attachments.length)
  ) {
    attachmentSizes = undefined;

    warn(
      '🔥🔥🔥 "attachmentSizes" is invalid. It is not an array with non-negative numbers or it does not have length matching the number of attachments in the activity.'
    );
  }

  return {
    attachmentSizes,
    avatarImage: imageFromActivity,
    avatarInitials: initialsFromActivity,
    deliveryStatus,
    // TODO: Deprecate this.
    key,
    messageBackDisplayText,
    messageSubType,
    readBy,
    senderName,
    trackingNumber,
    // TODO: Deprecate this.
    who
  };
}
