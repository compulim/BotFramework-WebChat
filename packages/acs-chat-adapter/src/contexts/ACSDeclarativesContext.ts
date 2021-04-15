import { ChatThreadClient } from '@azure/communication-chat';
import { createContext } from 'react';
import { DeclarativeChatClient } from '@azure/acs-chat-declarative';

const context = createContext<{
  declarativeChatClient: DeclarativeChatClient;
  declarativeChatThreadClient: ChatThreadClient;
  threadId: string;
}>(undefined);

context.displayName = 'ACSChatAdapter.DeclarativesContext';

export default context;
