export default function getMetadata(activity) {
  const {
    channelData: {
      'webchat:avatar:image': imageFromActivity,
      'webchat:avatar:initials': initialsFromActivity,
      'webchat:sender-name': senderName,
      'webchat:who': who
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
