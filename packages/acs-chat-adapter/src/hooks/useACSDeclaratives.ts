import { ChatThreadClient } from '@azure/communication-chat';
import { DeclarativeChatClient } from '@azure/acs-chat-declarative';
import { useContext } from 'react';

import ACSDeclarativesContext from '../contexts/ACSDeclarativesContext';

export default function useACSDeclaratives(): {
  declarativeChatClient: DeclarativeChatClient;
  declarativeChatThreadClient: ChatThreadClient;
  threadId: string;
} {
  const { declarativeChatClient, declarativeChatThreadClient, threadId } = useContext(ACSDeclarativesContext);

  return { declarativeChatClient, declarativeChatThreadClient, threadId };
}
