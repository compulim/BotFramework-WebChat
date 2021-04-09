/* eslint complexity: ["error", 30] */

import { warn } from '../utils/warn';
import Activity from '../types/Activity';
import ActivityMetadata from '../types/ActivityMetadata';
import updateIn from 'simple-update-in';

export default function updateMetadata<T extends Partial<Activity>>(
  activity: T,
  partialMetadata: Partial<ActivityMetadata>
): T {
  const {
    attachmentSizes,
    avatarImage,
    avatarInitials,
    deliveryStatus,
    key,
    messageBackDisplayText,
    messageSubType,
    readBy,
    senderName,
    trackingNumber,
    who
  } = partialMetadata;

  if (typeof attachmentSizes !== 'undefined') {
    if (
      Array.isArray(attachmentSizes) &&
      attachmentSizes.every(size => typeof size === 'number' && size >= 0) &&
      attachmentSizes.length === activity.attachments.length
    ) {
      activity = updateIn(
        activity,
        ['channelData', 'webchat:attachment:sizes'],
        attachmentSizes ? () => attachmentSizes : undefined
      );
    } else {
      warn(
        '🔥🔥🔥 "attachmentSizes" must be an array with non-negative numbers and with length matching the number of attachments in the activity.'
      );
    }
  }

  if (typeof avatarImage !== 'undefined') {
    activity = updateIn(activity, ['channelData', 'webchat:sender:image'], avatarImage ? () => avatarImage : undefined);
  }

  if (typeof avatarInitials !== 'undefined') {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:sender:initials'],
      avatarInitials ? () => avatarInitials : undefined
    );
  }

  if (typeof deliveryStatus !== 'undefined') {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:delivery-status'],
      deliveryStatus ? () => deliveryStatus : undefined
    );

    // TODO: Deprecate "channelData.state" field once we completely moved to "delivery-status".
    activity = updateIn(
      activity,
      ['channelData', 'webchat:delivery-status'],
      deliveryStatus ? () => deliveryStatus : undefined
    );
  }

  if (typeof key !== 'undefined') {
    activity = updateIn(activity, ['channelData', 'webchat:key'], key ? () => key : undefined);
  }

  if (typeof messageBackDisplayText !== 'undefined') {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:message-back:display-text'],
      messageBackDisplayText ? () => messageBackDisplayText : undefined
    );
  }

  if (typeof messageSubType !== 'undefined') {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:message:subtype'],
      messageSubType ? () => messageSubType : undefined
    );
  }

  if (typeof readBy !== 'undefined') {
    activity = updateIn(activity, ['channelData', 'webchat:read-by'], readBy ? () => readBy : undefined);
  }

  if (typeof senderName !== 'undefined') {
    activity = updateIn(activity, ['channelData', 'webchat:sender:name'], senderName ? () => senderName : undefined);
  }

  if (typeof senderName !== 'undefined') {
    activity = updateIn(activity, ['channelData', 'webchat:sender:name'], senderName ? () => senderName : undefined);
  }

  if (typeof trackingNumber !== 'undefined') {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:tracking-number'],
      trackingNumber ? () => trackingNumber : undefined
    );
  }

  if (typeof who !== 'undefined') {
    activity = updateIn(activity, ['channelData', 'webchat:sender:who'], who ? () => who : undefined);

    // TODO: Deprecate setting "from.role" field when we no longer use the "from.role" field.
    activity = updateIn(
      activity,
      ['from', 'role'],
      who ? () => (who === 'self' ? 'user' : who === 'service' ? 'channel' : 'bot') : undefined
    );
  }

  return activity;
}
