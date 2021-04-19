import { ChatThreadClient } from '@azure/communication-chat';
import { DeclarativeChatClient } from '@azure/acs-chat-declarative';
import { useContext } from 'react';

import ACSClientsContext from '../contexts/ACSClientsContext';

export default function useACSClients(): {
  declarativeChatClient: DeclarativeChatClient;
  declarativeChatThreadClient: ChatThreadClient;
  threadId: string;
  userId: string;
} {
  const { declarativeChatClient, declarativeChatThreadClient, threadId, userId } = useContext(ACSClientsContext);

  return { declarativeChatClient, declarativeChatThreadClient, threadId, userId };
}
