import { createContext } from 'react';

import Activity from '../types/Activity';

const context = createContext<Activity[]>(undefined);

context.displayName = 'ACSChatAdapter.ActivitiesContext';

export default context;
