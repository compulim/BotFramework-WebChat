import { useCallback } from 'react';
import { useSendMessage } from '@azure/acs-ui-sdk';

import useACSUserId from './useACSUserId';

export default function useACSSendMessage(username?: string): (message: string) => void {
  const [userId] = useACSUserId();
  const sendMessage = useSendMessage();

  return useCallback((message: string) => sendMessage(username, userId, message), [username, userId, sendMessage]);
}
