import { useMemo } from 'react';
import { useTypingUsers } from '@azure/acs-ui-sdk';

import createACSTypingUserToWebChatTypingEntry from '../util/createACSTypingUserToWebChatTypingEntry';
import useACSIdentity from './useACSIdentity';
import useMapper from './useMapper';
import useThreadMembersWithFetch from './useThreadMembersWithFetch';

export default function useWebChatTyping() {
  const identity = useACSIdentity();
  const threadMembers = useThreadMembersWithFetch();

  const acsTypingUserToWebChatTypingEntry = useMemo(() => createACSTypingUserToWebChatTypingEntry(identity), [
    identity
  ]);
  const typingUsers = useTypingUsers(threadMembers);

  const typingEntries = useMapper(typingUsers, acsTypingUserToWebChatTypingEntry);

  return useMemo(() => {
    const now = Date.now();

    return Object.fromEntries(
      typingEntries.map(([id, typingEntry]) => [
        id,
        {
          ...typingEntry,
          at: now
        }
      ])
    );
  }, [typingEntries]);
}
