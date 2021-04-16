import { useContext } from 'react';

import ACSReadReceipt from '../types/ACSReadReceipt';
import ACSReadReceiptsContext from '../contexts/ACSReadReceiptsContext';

export default function useACSReadReceipts(): [ACSReadReceipt[]] {
  return [useContext(ACSReadReceiptsContext)];
}
