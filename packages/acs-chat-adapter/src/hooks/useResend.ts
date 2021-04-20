import { useContext } from 'react';

import SendMessageContext from '../contexts/SendMessageContext';

export default function useResend(): (trackingNumber: string) => string {
  return useContext(SendMessageContext).resend;
}
