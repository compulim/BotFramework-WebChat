import { Notification, Notifications } from 'botframework-webchat-core';
import { useMemo } from 'react';

import useConnectivityStatusNotification from './useConnectivityStatusNotification';

export default function useNotifications(): [Notifications] {
  const [connectivityStatusNotification] = useConnectivityStatusNotification();

  // TODO: Remove this.
  const welcomeNotification = useMemo<Notification>(
    () => ({
      id: 'acs:welcome',
      level: 'success',
      message: 'You are connected to Azure Communication Services.'
    }),
    []
  );

  return useMemo(() => [{ ...connectivityStatusNotification, 'acs:welcome': welcomeNotification }], [
    connectivityStatusNotification,
    welcomeNotification
  ]);
}
