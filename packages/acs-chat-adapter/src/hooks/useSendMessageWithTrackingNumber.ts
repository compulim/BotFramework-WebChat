import { useContext } from 'react';

import SendMessageContext from '../contexts/SendMessageContext';

export default function useSendMessageWithTrackingNumber(): (message: string) => string | undefined {
  return useContext(SendMessageContext).sendMessage;
}
