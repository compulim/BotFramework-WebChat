import { useTypingUsers } from '@azure/acs-ui-sdk';

import useACSThreadMembersWithFetch from './useACSThreadMembersWithFetch';
import useMapper from './useMapper';

let EMPTY_ARRAY;
let PASSTHRU_FN;

export default function useACSTypingUsers() {
  EMPTY_ARRAY || (EMPTY_ARRAY = []);
  PASSTHRU_FN || (PASSTHRU_FN = value => value);

  const [threadMembers] = useACSThreadMembersWithFetch();

  const result = useTypingUsers(threadMembers);

  return [useMapper(result && result.length ? result : EMPTY_ARRAY, PASSTHRU_FN)];
}
