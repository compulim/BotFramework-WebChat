import { useContext } from 'react';

import { ACSChatMessage } from '../types/ACSChatMessage';

import ACSChatMessagesContext from '../context/ACSChatMessagesContext';

export default function useACSChatMessages(): [ACSChatMessage[]] {
  return [useContext(ACSChatMessagesContext)];
}
