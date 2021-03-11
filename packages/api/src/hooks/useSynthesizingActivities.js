import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useSynthesizingActivities() {
  const { synthesizingActivities } = useWebChatSpeechContext();

  return [synthesizingActivities];
}
