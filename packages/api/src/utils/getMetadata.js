export default function getMetadata(activity) {
  const {
    channelData: {
      'webchat:sender:image': imageFromActivity,
      'webchat:sender:initials': initialsFromActivity,
      'webchat:sender:name': senderName,
      'webchat:sender:who': who
    },
    // TODO: Remove "from".
    from: { role } = {}
  } = activity;

  return {
    avatarImage: imageFromActivity,
    avatarInitials: initialsFromActivity,
    senderName,
    who: who || (role === 'user' ? 'self' : 'others')
  };
}
