import { useMemo } from 'react';

import { Notification } from '../types/Notification';

import useConnectionNotification from './useConnectionNotification';

export default function useNotifications(): [Notification[]] {
  const [connectionNotification] = useConnectionNotification();
  const customNotification = useMemo<Notification>(
    () => ({
      id: 'acs:1',
      level: 'success',
      message: 'You are connected to Azure Communication Services.'
    }),
    []
  );

  return useMemo(() => [[connectionNotification, customNotification]], [connectionNotification, customNotification]);
}
