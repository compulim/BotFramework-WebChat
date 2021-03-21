import { useMemo } from 'react';

import { WebChatTypingUsers } from '../types/WebChatTypingUsers';

import createACSTypingUserToWebChatTypingEntryConverter from '../converters/createACSTypingUserToWebChatTypingEntryConverter';
import useACSTypingUsers from './useACSTypingUsers';
import useACSUserId from './useACSUserId';
import useDebugDeps from './useDebugDeps';
import useMapper from './useMapper';

export default function useTypingUsers(): [WebChatTypingUsers] {
  const [typingUsers] = useACSTypingUsers();
  const [userId] = useACSUserId();

  const acsTypingUserToWebChatTypingEntry = useMemo(() => createACSTypingUserToWebChatTypingEntryConverter(userId), [userId]);

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
