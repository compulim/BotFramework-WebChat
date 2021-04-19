import { useCallback } from 'react';
import useACSClients from './useACSClients';

export default function useACSSendReadReceipt(): (chatMessageId: string) => void {
  const { declarativeChatThreadClient } = useACSClients();

  return useCallback(
    async (chatMessageId: string) => {
      await (declarativeChatThreadClient && declarativeChatThreadClient.sendReadReceipt({ chatMessageId }));
    },
    [declarativeChatThreadClient]
  );
}
