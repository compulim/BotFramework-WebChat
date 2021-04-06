import warn from './warn';

export default function getMetadata(activity) {
  const {
    channelData: {
      clientActivityID: clientActivityId,
      'webchat:key': key,
      'webchat:sender:image': imageFromActivity,
      'webchat:sender:initials': initialsFromActivity,
      'webchat:sender:name': senderName,
      'webchat:sender:who': who
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
    // TODO: Deprecate this.
    key: key || clientActivityId || id,
    senderName,
    // TODO: Deprecate this.
    who: who || (role === 'user' ? 'self' : 'others')
  };
}
