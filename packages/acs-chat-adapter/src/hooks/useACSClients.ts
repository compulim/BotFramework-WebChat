import { ChatThreadClient } from '@azure/communication-chat';
import { DeclarativeChatClient } from '@azure/acs-chat-declarative';
import { useContext } from 'react';

import ACSClientsContext from '../contexts/ACSClientsContext';

export default function useACSClients(): {
  declarativeChatClient: DeclarativeChatClient;
  declarativeChatThreadClient: ChatThreadClient;
  threadId: string;
} {
  const { declarativeChatClient, declarativeChatThreadClient, threadId } = useContext(ACSClientsContext);

  return { declarativeChatClient, declarativeChatThreadClient, threadId };
}
