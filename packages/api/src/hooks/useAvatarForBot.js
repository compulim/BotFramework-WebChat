import useStyleOptions from './useStyleOptions';

export default function useAvatarForBot() {
  // TODO: Add deprecation notes
  const [{ botAvatarImage: image, botAvatarInitials: initials }] = useStyleOptions();

  return [
    {
      image,
      initials
    }
  ];
}
