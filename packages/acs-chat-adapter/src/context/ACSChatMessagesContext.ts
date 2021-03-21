import { createContext } from 'react';

import { ACSChatMessage } from '../types/ACSChatMessage';

const context = createContext<ACSChatMessage[]>(undefined);

context.displayName = 'ACSChatAdapter.ChatMessagesContext';

export default context;
