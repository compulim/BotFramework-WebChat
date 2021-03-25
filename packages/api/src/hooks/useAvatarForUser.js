import useStyleOptions from './useStyleOptions';

export default function useAvatarForUser() {
  // TODO: Add deprecation notes
  const [{ userAvatarImage: image, userAvatarInitials: initials }] = useStyleOptions();

  return [
    {
      image,
      initials
    }
  ];
}
