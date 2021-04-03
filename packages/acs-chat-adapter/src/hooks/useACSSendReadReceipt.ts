import { useCallback } from 'react';
import { useSendReadReceipt } from '@azure/acs-ui-sdk';

export default function useACSSendReadReceipt(): (chatMessageId: string) => Promise<void> {
  const acsSendReadReceipt = useSendReadReceipt();

  return useCallback((chatMessageId: string) => acsSendReadReceipt(chatMessageId), [acsSendReadReceipt]);
}
