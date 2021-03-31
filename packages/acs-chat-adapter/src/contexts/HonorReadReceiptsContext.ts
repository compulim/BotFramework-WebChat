import { createContext } from 'react';

const context = createContext<
  [honorReadReceipts: boolean, setHonorReadReceipts: (nextHonorReadReceipts: boolean) => void]
>(undefined);

context.displayName = 'ACSChatAdapter.HonorReadReceiptsContext';

export default context;
