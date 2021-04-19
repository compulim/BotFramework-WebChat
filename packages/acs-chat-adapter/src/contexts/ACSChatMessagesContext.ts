import { ConnectivityStatus } from 'botframework-webchat-core';
import { createContext } from 'react';

import ACSChatMessage from '../types/ACSChatMessage';

const context = createContext<{ chatMessages: Map<string, ACSChatMessage>; connectivityStatus: ConnectivityStatus }>(
  undefined
);

context.displayName = 'ACSChatAdapter.ChatMessagesContext';

export default context;
