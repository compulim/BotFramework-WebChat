import { createContext } from 'react';

const context = createContext<{
  keyToTrackingNumber: { [key: string]: string };
  resend: (trackingNumber: string) => string;
  sendMessage: (message: string) => string;
}>(undefined);

context.displayName = 'ACSChatAdapter.SendMessageContext';

export default context;
