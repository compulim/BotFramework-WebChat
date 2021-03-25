export default function getMetadata(activity) {
  const {
    channelData: {
      'webchat:avatar:image': imageFromActivity,
      'webchat:avatar:initials': initialsFromActivity,
      'webchat:who': who
    },
    from: { role } = {}
  } = activity;

  return {
    avatarImage: imageFromActivity,
    avatarInitials: initialsFromActivity,
    who: who || (role === 'user' ? 'self' : 'others')
  };
}
