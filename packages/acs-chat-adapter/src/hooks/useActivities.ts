import { useContext } from 'react';

import { Activity } from '../types/Activity';
import ActivitiesContext from '../contexts/ActivitiesContext';

export default function useActivities(): [Activity[]] {
  return [useContext(ActivitiesContext)];
}
