import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect } from 'react';

import ACSReadReceipt from '../types/ACSReadReceipt';
import ACSReadReceiptsContext from '../contexts/ACSReadReceiptsContext';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatThreadSelector from '../hooks/useACSChatThreadSelector';
import useACSClients from '../hooks/useACSClients';

let debug;

const ACSReadReceiptsComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSReadReceiptsComposer>', { backgroundColor: 'orange', color: 'black' }));

  const { declarativeChatThreadClient } = useACSClients();

  // Required.
  useEffect(() => {
    if (!declarativeChatThreadClient) {
      return;
    }

    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();

      debug('Initial fetch started');

      let numReadReceipts = 0;

      for await (const _ of declarativeChatThreadClient.listReadReceipts()) {
        if (abortController.signal.aborted) {
          break;
        }

        numReadReceipts++;
      }

      debug(
        `Initial fetch done, took %c${Date.now() - now} ms%c for %c${numReadReceipts}%c read receipts.`,
        ...styleConsole('green'),
        ...styleConsole('purple')
      );
    })();

    return () => abortController.abort();
  }, [declarativeChatThreadClient]);

  const readReceipts: ACSReadReceipt[] = useACSChatThreadSelector(useCallback(state => state?.readReceipts, []));

  debug([`Got %c${readReceipts?.length || 0} read receipts%c.`, ...styleConsole('purple')], [{ readReceipts }]);

  return <ACSReadReceiptsContext.Provider value={readReceipts}>{children}</ACSReadReceiptsContext.Provider>;
};

ACSReadReceiptsComposer.defaultProps = {
  children: undefined
};

ACSReadReceiptsComposer.propTypes = {
  children: PropTypes.any
};

export default ACSReadReceiptsComposer;
