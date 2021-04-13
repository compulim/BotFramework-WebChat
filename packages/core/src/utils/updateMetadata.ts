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

  if ('attachmentSizes' in partialMetadata) {
    if (
      Array.isArray(attachmentSizes) &&
      attachmentSizes.every(size => {
        const type = typeof size;

        return type === 'undefined' || (type === 'number' && size >= 0);
      }) &&
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

  if ('avatarImage' in partialMetadata) {
    activity = updateIn(activity, ['channelData', 'webchat:sender:image'], avatarImage ? () => avatarImage : undefined);
  }

  if ('avatarInitials' in partialMetadata) {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:sender:initials'],
      avatarInitials ? () => avatarInitials : undefined
    );
  }

  if ('deliveryStatus' in partialMetadata) {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:delivery-status'],
      deliveryStatus ? () => deliveryStatus : undefined
    );
  }

  if ('key' in partialMetadata) {
    activity = updateIn(activity, ['channelData', 'webchat:key'], key ? () => key : undefined);
  }

  if ('messageBackDisplayText' in partialMetadata) {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:message-back:display-text'],
      messageBackDisplayText ? () => messageBackDisplayText : undefined
    );
  }

  if ('messageSubType' in partialMetadata) {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:message:sub-type'],
      messageSubType ? () => messageSubType : undefined
    );
  }

  if ('readBy' in partialMetadata) {
    activity = updateIn(activity, ['channelData', 'webchat:read-by'], readBy ? () => readBy : undefined);
  }

  if ('senderName' in partialMetadata) {
    activity = updateIn(activity, ['channelData', 'webchat:sender:name'], senderName ? () => senderName : undefined);
  }

  if ('senderName' in partialMetadata) {
    activity = updateIn(activity, ['channelData', 'webchat:sender:name'], senderName ? () => senderName : undefined);
  }

  if ('trackingNumber' in partialMetadata) {
    activity = updateIn(
      activity,
      ['channelData', 'webchat:tracking-number'],
      trackingNumber ? () => trackingNumber : undefined
    );
  }

  if ('who' in partialMetadata) {
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
