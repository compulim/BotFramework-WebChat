import { useContext } from 'react';

import ACSChatMessage from '../types/ACSChatMessage';
import ACSChatMessagesContext from '../contexts/ACSChatMessagesContext';

export default function useACSChatMessages(): [Map<string, ACSChatMessage>] {
  return [useContext(ACSChatMessagesContext).chatMessages];
}
