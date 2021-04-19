import { useCallback } from 'react';

import createDebug from '../utils/debug';
import useACSClients from './useACSClients';

let debug;

export default function useEmitTyping(): () => Promise<void> {
  debug || (debug = createDebug('useACSSendTypingNotification', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSClients();

  return useCallback(async () => {
    debug('Calling ACS sendTypingNotification');

    await (declarativeChatThreadClient && declarativeChatThreadClient.sendTypingNotification());
  }, [declarativeChatThreadClient]);
}
