import { useContext } from 'react';

import SendMessageContext from '../contexts/SendMessageContext2';

export default function useSendMessageWithTrackingNumber(): (message: string) => string {
  return useContext(SendMessageContext).sendMessage;
}
