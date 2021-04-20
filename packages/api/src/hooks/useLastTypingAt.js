import { useMemo } from 'react';

import { useContext } from '../contexts/TypingContext';

let showDeprecationNotes = true;

export default function useLastTypingAt() {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useLastTypingAt" is deprecated. Please use "useActiveTyping" instead. This hook will be removed on or after 2022-02-16.'
    );

    showDeprecationNotes = false;
  }

  const { typingUsers } = useContext();

  return useMemo(() => Object.fromEntries(Object.entries(typingUsers).map(([userId, { at }]) => [userId, at])), [
    typingUsers
  ]);
}
