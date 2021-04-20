import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useEffect, useMemo } from 'react';

import ACSReadReceipt from '../types/ACSReadReceipt';
import ACSReadReceiptsContext from '../contexts/ACSReadReceiptsContext';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatThreadSelector from '../hooks/useACSChatThreadSelector';
import useACSClients from '../hooks/useACSClients';

const PAGE_SIZE = 100;
let debug;
let EMPTY_ARRAY;

const ACSReadReceiptsComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ACSReadReceiptsComposer>', { backgroundColor: 'yellow', color: 'black' }));
  EMPTY_ARRAY || (EMPTY_ARRAY = []);

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
      let numReadReceipts = 0;

      for await (const _ of declarativeChatThreadClient.listReadReceipts().byPage({ maxPageSize: PAGE_SIZE })) {
        if (abortController.signal.aborted) {
          break;
        }

        numReadReceipts++;
      }

      debug(
        `Initial fetch done, got %c${numReadReceipts}%c read receipts, took %c${Date.now() - now} ms%c.`,
        ...styleConsole('purple'),
        ...styleConsole('green')
      );
    })();

    return () => abortController.abort();
  }, [declarativeChatThreadClient]);

  const readReceipts: ACSReadReceipt[] = useACSChatThreadSelector(
    useCallback(state => state?.readReceipts || EMPTY_ARRAY, [])
  );

  useMemo(() => {
    debug([`Got %c${readReceipts?.length || 0} read receipts%c.`, ...styleConsole('purple')], [{ readReceipts }]);
  }, [readReceipts]);

  return <ACSReadReceiptsContext.Provider value={readReceipts}>{children}</ACSReadReceiptsContext.Provider>;
};

ACSReadReceiptsComposer.defaultProps = {
  children: undefined
};

ACSReadReceiptsComposer.propTypes = {
  children: PropTypes.any
};

export default ACSReadReceiptsComposer;
