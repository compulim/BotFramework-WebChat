import { useCallback } from 'react';

import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSClients from './useACSClients';

let debug;

export default function useACSSendTypingNotification(): () => Promise<void> {
  debug || (debug = createDebug('useACSSendTypingNotification', { backgroundColor: 'yellow', color: 'black' }));

  const { declarativeChatThreadClient } = useACSClients();

  return useCallback(async () => {
    const now = Date.now();

    await (declarativeChatThreadClient && declarativeChatThreadClient.sendTypingNotification());

    debug(`Typing notification sent, took %c${Date.now() - now}%c ms.`, ...styleConsole('green'));
  }, [declarativeChatThreadClient]);
}
