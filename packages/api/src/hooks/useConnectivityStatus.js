import { useMemo } from 'react';

import useNotifications from './useNotifications';

export default function useConnectivityStatus() {
  const [notifications] = useNotifications();

  return useMemo(() => {
    const notification = notifications.find(({ id }) => id === 'connectivitystatus');

    return notification && notification.data;
  }, [notifications]);
}
