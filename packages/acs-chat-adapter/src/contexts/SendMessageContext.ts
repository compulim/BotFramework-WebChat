import { createContext } from 'react';

const context = createContext<(message: string) => string>(undefined);

context.displayName = 'ACSChatAdapter.SendMessageContext';

export default context;
