import useAPIContext from './internal/useAPIContext';
import useLocalizedStrings from './internal/useLocalizedStrings';

export default function useLanguage(options) {
  const { language } = useAPIContext();
  const localizedStrings = useLocalizedStrings();

  if (options === 'speech') {
    return [localizedStrings.SPEECH_LANGUAGE || language];
  }

  return [language];
}
