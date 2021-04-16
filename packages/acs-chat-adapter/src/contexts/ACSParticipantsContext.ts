import { createContext } from 'react';

import ACSParticipant from '../types/ACSParticipant';

const context = createContext<ACSParticipant[]>(undefined);

context.displayName = 'ACSChatAdapter.Participants';

export default context;
