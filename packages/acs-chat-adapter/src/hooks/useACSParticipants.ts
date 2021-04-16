import { useContext } from 'react';

import ACSParticipant from '../types/ACSParticipant';
import ACSParticipantsContext from '../contexts/ACSParticipantsContext';

export default function useACSParticipants(): [ACSParticipant[]] {
  return [useContext(ACSParticipantsContext)];
}
