import { useMemo, useRef } from 'react';

import useACSConnected from './useACSConnected';

export default function useNotifications() {
  const [connected] = useACSConnected();
  const wasConnectedRef = useRef();

  if (connected) {
    wasConnectedRef.current = true;
  }

  return useMemo(
    () => [
      {
        data: connected ? 'connected' : wasConnectedRef.current ? 'reconnecting' : 'connecting',
        id: 'connectivitystatus',
        timestamp: Date.now()
      }
    ],
    [connected, wasConnectedRef]
  );
}
