export default function createAvatarStyle({ avatarBorderRadius, avatarSize }) {
  return {
    '&.webchat__default-avatar': {
      borderRadius: avatarBorderRadius,
      height: avatarSize,
      width: avatarSize
    }
  };
}
