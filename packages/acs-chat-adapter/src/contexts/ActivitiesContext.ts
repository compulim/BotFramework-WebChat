import { createContext } from 'react';

import { WebChatActivity } from '../types/WebChatActivity';

const context = createContext<WebChatActivity[]>(undefined);

context.displayName = 'ACSChatAdapter.ActivitiesContext';

export default context;
