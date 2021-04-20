import { useContext } from 'react';

import ActivitiesContext from '../../contexts/internal/ActivitiesContext';

export default function useActivitiesContext() {
  const context = useContext(ActivitiesContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
