import { createContext } from 'react';
import { TypingUsers } from 'botframework-webchat-core';

const TypingUsersContext = createContext<[TypingUsers]>(undefined);

TypingUsersContext.displayName = 'TypingUsersContext';

export default TypingUsersContext;
