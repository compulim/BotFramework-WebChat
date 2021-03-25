export default function getMetadata(activity) {
  const {
    channelData: {
      'webchat:avatar:image': imageFromActivity,
      'webchat:avatar:initials': initialsFromActivity,
      'webchat:display-name': displayName,
      'webchat:who': who
    },
    // TODO: Remove "from".
    from: { role } = {}
  } = activity;

  return {
    avatarImage: imageFromActivity,
    avatarInitials: initialsFromActivity,
    displayName,
    who: who || (role === 'user' ? 'self' : 'others')
  };
}
