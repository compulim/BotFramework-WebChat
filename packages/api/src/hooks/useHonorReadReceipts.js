import useActivitiesContext from './internal/useActivitiesContext';

export default function useHonorReadReceipts() {
  const { honorReadReceipts, setHonorReadReceipts } = useActivitiesContext();

  // If the chat adapter does not support return read receipt, both getter and setter will be undefined.
  return setHonorReadReceipts ? [honorReadReceipts, setHonorReadReceipts] : [];
}
