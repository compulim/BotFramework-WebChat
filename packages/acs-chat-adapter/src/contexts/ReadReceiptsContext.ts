import { createContext } from 'react';

import { WebChatReadReceipts } from '../types/WebChatReadReceipts';

const context = createContext<WebChatReadReceipts>(undefined);

context.displayName = 'ACSChatAdapter.ReadReceiptsContext';

export default context;
