import { createContext } from 'react';

import ACSParticipant from '../types/ACSParticipant';

const context = createContext<Map<string, ACSParticipant>>(undefined);

context.displayName = 'ACSChatAdapter.Participants';

export default context;
