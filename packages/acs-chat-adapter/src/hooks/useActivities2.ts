import { useContext } from 'react';

import { WebChatActivity } from '../types/WebChatActivity';
import ActivitiesContext from '../context/ActivitiesContext';

export default function useActivities2(): [WebChatActivity[]] {
  return [useContext(ActivitiesContext)];
}
