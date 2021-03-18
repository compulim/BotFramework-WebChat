import { useCallback } from 'react';
import { useSendMessage } from '@azure/acs-ui-sdk';

import useACSDisplayName from './useACSDisplayName';
import useACSUserId from './useACSUserId';

export default function useACSSendMessage() {
  const [displayName] = useACSDisplayName();
  const [userId] = useACSUserId();
  const sendMessage = useSendMessage();

  return useCallback(message => sendMessage(displayName, userId, message), [displayName, userId, sendMessage]);
}
