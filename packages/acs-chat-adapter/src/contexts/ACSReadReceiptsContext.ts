import { createContext } from 'react';

import ACSReadReceipt from '../types/ACSReadReceipt';

const context = createContext<ACSReadReceipt[]>(undefined);

context.displayName = 'ACSChatAdapter.ReadReceiptsContext';

export default context;
