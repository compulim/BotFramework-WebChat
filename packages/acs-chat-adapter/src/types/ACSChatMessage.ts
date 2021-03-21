import { ChatMessage } from '@azure/communication-chat';

type ACSChatMessage = ChatMessage & { clientMessageId: string };

export { ACSChatMessage };
