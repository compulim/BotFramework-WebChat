import { useContext } from 'react';

import NotificationContext from '../../contexts/internal/NotificationContext';

export default function useNotificationContext() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
