import { useContext } from 'react';

import HonorReadReceiptsContext from '../contexts/HonorReadReceiptsContext';

export default function useHonorReadReceipts(): [boolean, (nextHonorReadReceipts: boolean) => void] {
  return useContext(HonorReadReceiptsContext);
}
