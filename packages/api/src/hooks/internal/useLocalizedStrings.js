import useAPIContext from './useAPIContext';

export default function useLocalizedStrings() {
  const { localizedStrings } = useAPIContext();

  return localizedStrings;
}
