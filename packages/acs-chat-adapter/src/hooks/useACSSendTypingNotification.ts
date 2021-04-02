import { useCallback } from 'react';
import { useSendTypingNotification as useACSSendTypingNotification } from '@azure/acs-ui-sdk';

import createDebug from '../utils/debug';

let debug;

export default function useEmitTyping(): () => void {
  debug || (debug = createDebug('useACSSendTypingNotification', { backgroundColor: 'yellow', color: 'black' }));

  const sendTypingNotification = useACSSendTypingNotification();

  return useCallback(() => {
    debug('Calling ACS sendTypingNotification');

    sendTypingNotification();
  }, [sendTypingNotification]);
}
