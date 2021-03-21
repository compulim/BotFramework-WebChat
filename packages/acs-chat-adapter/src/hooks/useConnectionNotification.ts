import { useEffect, useState } from 'react';
import { useFetchMessages } from '@azure/acs-ui-sdk';
import AbortController from 'abort-controller-es5';

import { WebChatNotification } from '../types/WebChatNotification';

import createDebug from '../util/debug';

let debug;

// Currently, ACS UI SDK does not status on connectivity.
// The easiest way is to check if messages has been fetched or not.
export default function useConnectionNotification(): [WebChatNotification] {
  debug || (debug = createDebug('acs:useConnectionNotification', { backgroundColor: 'yellow', color: 'black' }));

  const [connectionNotification, setConnectionNotification] = useState<WebChatNotification>({
    id: 'connectivitystatus',
    data: 'connecting'
  });

  const fetchMessages = useFetchMessages();

  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      try {
        await fetchMessages();
      } catch (err) {
        return (
          abortController.signal.aborted ||
          setConnectionNotification({
            id: 'connectivitystatus',
            data: 'fatal'
          })
        );
      }

      abortController.signal.aborted ||
        setConnectionNotification({
          id: 'connectivitystatus',
          data: 'connected'
        });
    })();

    return () => abortController.abort();
  }, [fetchMessages, setConnectionNotification]);

  return [connectionNotification];
}
