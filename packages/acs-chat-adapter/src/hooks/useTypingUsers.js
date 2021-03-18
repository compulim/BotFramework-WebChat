import { useMemo } from 'react';

import createACSTypingUserToWebChatTypingEntry from '../util/createACSTypingUserToWebChatTypingEntry';
import useACSTypingUsers from './useACSTypingUsers';
import useACSUserId from './useACSUserId';
import useDebugDeps from './useDebugDeps';
import useMapper from './useMapper';

export default function useTypingUsers() {
  const [typingUsers] = useACSTypingUsers();
  const [userId] = useACSUserId();

  const acsTypingUserToWebChatTypingEntry = useMemo(() => createACSTypingUserToWebChatTypingEntry(userId), [userId]);

  const typingEntries = useMapper(typingUsers, acsTypingUserToWebChatTypingEntry);

  useDebugDeps(
    {
      typingEntries,
      typingUsers,
      userId
    },
    'acs:useTypingUsers'
  );

  return useMemo(() => {
    const now = Date.now();

    return [
      Object.fromEntries(
        typingEntries.map(([id, typingEntry]) => [
          id,
          {
            ...typingEntry,
            at: now
          }
        ])
      )
    ];
  }, [typingEntries]);
}
