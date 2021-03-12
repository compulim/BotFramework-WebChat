import { useSelector } from './internal/WebChatReduxContext';
import useWebChatSpeechContext from './internal/WebChatSpeechContext';

// TODO: Add options to support: "all" (default), "render" and "speechsynthesis".
export default function useActivities(options = 'all') {
  const allActivities = useSelector(({ activities }) => activities);
  const { synthesizingActivities } = useWebChatSpeechContext();

  return [options === 'speechsynthesis' ? synthesizingActivities : allActivities];
}
