import { useMemo } from 'react';

import { WebChatNotification } from '../types/WebChatNotification';

import useConnectionNotification from './useConnectionNotification';

export default function useNotifications(): [WebChatNotification[]] {
  const [connectionNotification] = useConnectionNotification();
  const customNotification = useMemo<WebChatNotification>(
    () => ({
      id: 'acs:1',
      level: 'success',
      message: 'You are connected to Azure Communication Services.'
    }),
    []
  );

  return useMemo(() => [[connectionNotification, customNotification]], [connectionNotification, customNotification]);
}
