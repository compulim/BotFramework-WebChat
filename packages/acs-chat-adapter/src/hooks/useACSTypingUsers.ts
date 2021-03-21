import { useTypingUsers } from '@azure/acs-ui-sdk';

import { ACSChatThreadMember } from '../types/ACSChatThreadMember';

import useACSThreadMembersWithFetch from './useACSThreadMembersWithFetch';
import useMapper from './useMapper';

let EMPTY_ARRAY;
let PASSTHRU_FN;

export default function useACSTypingUsers(): [ACSChatThreadMember[]] {
  EMPTY_ARRAY || (EMPTY_ARRAY = []);
  PASSTHRU_FN || (PASSTHRU_FN = value => value);

  const [threadMembers] = useACSThreadMembersWithFetch();

  const result = useTypingUsers(threadMembers);

  return [
    useMapper<ACSChatThreadMember, ACSChatThreadMember>(result && result.length ? result : EMPTY_ARRAY, PASSTHRU_FN)
  ];
}
