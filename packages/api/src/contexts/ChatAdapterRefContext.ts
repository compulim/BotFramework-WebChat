import { ChatAdapter } from 'botframework-webchat-core';
import { createContext, MutableRefObject } from 'react';

const context = createContext<MutableRefObject<ChatAdapter>>(undefined);

context.displayName = 'WebChat.ChatAdapterRefContext';

export default context;
