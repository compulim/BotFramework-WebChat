import useWebChatActivitiesContext from './internal/useWebChatActivitiesContext';

export default function useHonorReadReceipts() {
  const { honorReadReceipts, setHonorReadReceipts } = useWebChatActivitiesContext();

  // If the chat adapter does not support return read receipt, both getter and setter will be undefined.
  return setHonorReadReceipts ? [honorReadReceipts, setHonorReadReceipts] : [];
}
