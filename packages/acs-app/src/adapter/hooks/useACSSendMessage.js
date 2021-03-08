import { useCallback } from 'react';
import { useSendMessage } from '@azure/acs-ui-sdk';

import useACSDisplayName from './useACSDisplayName';
import useACSIdentity from './useACSIdentity';

export default function useACSSendMessage() {
  const displayName = useACSDisplayName();
  const identity = useACSIdentity();
  const sendMessage = useSendMessage();

  return useCallback(message => sendMessage(displayName, identity, message), [displayName, identity, sendMessage]);
}
