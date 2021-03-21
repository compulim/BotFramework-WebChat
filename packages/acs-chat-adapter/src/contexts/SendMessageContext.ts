import { createContext } from 'react';

const context = createContext<{
  resend: (trackingNumber: string) => string;
  sendMessage: (message: string) => string;
}>(undefined);

context.displayName = 'ACSChatAdapter.SendMessageContext';

export default context;
