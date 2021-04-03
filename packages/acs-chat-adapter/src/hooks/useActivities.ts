import { useContext } from 'react';

import ActivitiesContext from '../contexts/ActivitiesContext';
import Activity from '../types/Activity';

export default function useActivities(): [Activity[]] {
  return [useContext(ActivitiesContext)];
}
