import { useMemo } from 'react';

import { TypingUsers } from '../types/TypingUsers';

import createACSTypingUserToWebChatTypingEntryConverter from '../converters/createACSTypingUserToWebChatTypingEntryConverter';
import useACSTypingUsers from './useACSTypingUsers';
import useACSUserId from './useACSUserId';
import useDebugDeps from './useDebugDeps';
import useMapper from './useMapper';

export default function useTypingUsers(): [TypingUsers] {
  const [typingUsers] = useACSTypingUsers();
  const [userId] = useACSUserId();

  const typingUsersExcludeSelf = useMemo(
    () => typingUsers.filter(member => member.user.communicationUserId !== userId),
    [typingUsers]
  );

  const acsTypingUserToWebChatTypingEntry = useMemo(() => createACSTypingUserToWebChatTypingEntryConverter(), []);

  const typingEntries = useMapper(typingUsersExcludeSelf, acsTypingUserToWebChatTypingEntry);

  useDebugDeps(
    {
      typingEntries,
      typingUsers,
      typingUsersExcludeSelf,
      userId
    },
    'acs:useTypingUsers'
  );

  return useMemo(() => [Object.fromEntries(typingEntries)], [typingEntries]);
}
