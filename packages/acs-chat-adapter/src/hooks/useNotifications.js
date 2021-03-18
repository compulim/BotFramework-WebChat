import { useMemo } from 'react';

import useConnectionNotification from './useConnectionNotification';

export default function useNotifications() {
  const [connectionNotification] = useConnectionNotification();
  const customNotification = useMemo(
    () => ({
      id: 'acs:1',
      level: 'success',
      message: 'You have connected to Azure Communication Services.'
    }),
    []
  );

  return useMemo(() => [[connectionNotification, customNotification]], [connectionNotification, customNotification]);
}
