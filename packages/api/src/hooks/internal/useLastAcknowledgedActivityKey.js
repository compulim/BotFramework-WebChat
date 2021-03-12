import useWebChatActivitiesContext from './useWebChatActivitiesContext';

export default function useLastAcknowledgedActivityKey() {
  const { lastAcknowledgedActivityKey, setLastAcknowledgedActivityKey } = useWebChatActivitiesContext();

  return [lastAcknowledgedActivityKey, setLastAcknowledgedActivityKey];
}
