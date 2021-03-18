import useWebChatActivitiesContext from './internal/useWebChatActivitiesContext';

export default function useAutoReturnReadReceipts() {
  const { autoReturnReadReceipts, setAutoReturnReadReceipts } = useWebChatActivitiesContext();

  // If the chat adapter does not support return read receipt, the setter function will be undefined.
  return setAutoReturnReadReceipts ? [autoReturnReadReceipts, setAutoReturnReadReceipts] : [autoReturnReadReceipts];
}
