/* eslint complexity: ["error", 30] */

import updateIn from 'simple-update-in';

export default function updateMetadata(
  activity,
  partialMetadata: {
    avatarImage?: string;
    avatarInitials?: string;
    deliveryStatus?: 'sending' | 'sent';
    key?: string;
    readBy?: 'some' | 'all';
    senderName?: string;
    trackingNumber?: string;
    who?: string;
  }
) {
  const { avatarImage, avatarInitials, deliveryStatus, key, readBy, senderName, trackingNumber, who } = partialMetadata;

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
