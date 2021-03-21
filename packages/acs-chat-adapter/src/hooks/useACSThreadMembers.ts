import { useContext } from 'react';

import { ACSChatThreadMember } from '../types/ACSChatThreadMember';

import ACSThreadMembersContext from '../contexts/ACSThreadMembersContext';

export default function useACSThreadMembers(): [ACSChatThreadMember[]] {
  return [useContext(ACSThreadMembersContext)];
}
