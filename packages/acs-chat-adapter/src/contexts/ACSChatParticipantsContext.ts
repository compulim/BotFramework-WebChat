import { createContext } from 'react';

import ACSChatParticipant from '../types/ACSChatParticipant';

const context = createContext<ACSChatParticipant[]>(undefined);

context.displayName = 'ACSChatAdapter.ChatParticipants';

export default context;
