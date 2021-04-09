import { ConnectivityStatus, Notifications } from 'botframework-webchat-core';
import { useEffect, useMemo, useState } from 'react';
import { useFetchMessages } from '@azure/acs-ui-sdk';
import AbortController from 'abort-controller-es5';

import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';

const NOTIFICATION_ID = 'connectivitystatus';
let debug;

// Currently, ACS UI SDK does not status on connectivity.
// The easiest way is to check if messages has been fetched or not.
export default function useConnectivityStatusNotification(): [Notifications] {
  debug || (debug = createDebug('acs:useConnectionNotification', { backgroundColor: 'yellow', color: 'black' }));

  const [connectivityStatus, setConnectivityStatus] = useState<ConnectivityStatus>('connecting');

  const fetchMessages = useFetchMessages();

  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      try {
        debug('Fetching first set of messages');

        await fetchMessages();
      } catch (err) {
        return abortController.signal.aborted || setConnectivityStatus('fatal');
      }

      abortController.signal.aborted || setConnectivityStatus('connected');
    })();

    return () => abortController.abort();
  }, [fetchMessages, setConnectivityStatus]);

  debug(`Connectivity status is %c${connectivityStatus}%c`, ...styleConsole('purple'));

  return useMemo(
    () => [
      {
        [NOTIFICATION_ID]: { data: connectivityStatus, id: NOTIFICATION_ID }
      }
    ],
    [connectivityStatus]
  );
}
