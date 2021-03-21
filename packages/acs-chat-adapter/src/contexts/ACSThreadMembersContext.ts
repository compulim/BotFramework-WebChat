import { createContext } from 'react';

import { ACSChatThreadMember } from '../types/ACSChatThreadMember';

const context = createContext<ACSChatThreadMember[]>(undefined);

context.displayName = 'ACSChatAdapter.ThreadMemberContext';

export default context;
