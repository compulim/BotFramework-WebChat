import { createContext } from 'react';

import { TypingUsers } from '../types/TypingUsers';

const TypingUsersContext = createContext<[TypingUsers]>(undefined);

TypingUsersContext.displayName = 'TypingUsersContext';

export default TypingUsersContext;
