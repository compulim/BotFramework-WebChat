import { Notifications } from 'botframework-webchat-core';
import { useContext, useMemo } from 'react';

import ACSChatMessagesContext from '../contexts/ACSChatMessagesContext';

const NOTIFICATION_ID = 'connectivitystatus';

export default function useNotifications(): [Notifications] {
  const { connectivityStatus } = useContext(ACSChatMessagesContext);

  return useMemo(
    () => [
      {
        // TODO: Remove this.
        'acs:welcome': {
          id: 'acs:welcome',
          level: 'success',
          message: 'You are connected to Azure Communication Services.'
        },
        [NOTIFICATION_ID]: { data: connectivityStatus, id: NOTIFICATION_ID }
      }
    ],
    [connectivityStatus]
  );
}
