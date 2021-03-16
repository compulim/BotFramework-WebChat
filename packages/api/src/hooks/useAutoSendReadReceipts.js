import useWebChatActivitiesContext from './internal/useWebChatActivitiesContext';

export default function useAutoSendReadReceipts() {
  const { autoSendReadReceipts, setAutoSendReadReceipts } = useWebChatActivitiesContext();

  return [autoSendReadReceipts, setAutoSendReadReceipts];
}
