import { createContext } from 'react';

const context = createContext<(typing: boolean) => void>(undefined);

context.displayName = 'ACSChatAdapter.EmitTypingContext';

export default context;
