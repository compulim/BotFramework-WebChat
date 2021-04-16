import { useContext } from 'react';

import ACSChatParticipant from '../types/ACSChatParticipant';
import ACSChatParticipantsContext from '../contexts/ACSChatParticipantsContext';

export default function useACSParticipants(): [ACSChatParticipant[]] {
  return [useContext(ACSChatParticipantsContext)];
}
