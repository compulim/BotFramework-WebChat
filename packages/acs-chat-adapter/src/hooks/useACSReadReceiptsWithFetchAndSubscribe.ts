import { useEffect, useMemo, useState } from 'react';
import { useFetchReadReceipts, useSubscribeReadReceipt } from '@azure/acs-ui-sdk';
import { useReceipts } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';
import AbortController from 'abort-controller-es5';

import { ACSReadReceipt } from '../types/ACSReadReceipt';

import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useDebugDeps from './useDebugDeps';
import useMapper from './useMapper';

// This helper is needed because:
// - useChatMessages() won't return conversation history, but only new outgoing messages during this session
// - But if we call fetchReadReceipts() once, it will return conversation history
// - But if we call useSubscribeReadReceipt() on every render, it will return new incoming messages

// I think the API design need some tweaks.

let debug;
let EMPTY_ARRAY;
let PASSTHRU_FN;

export default function useACSReadReceiptsWithFetchAndSubscribe(): [ACSReadReceipt[]] {
  debug ||
    (debug = createDebug('acs:useReadReceiptsWithFetchAndSubscribe', { backgroundColor: 'yellow', color: 'black' }));
  EMPTY_ARRAY || (EMPTY_ARRAY = []);
  PASSTHRU_FN || (PASSTHRU_FN = value => value);

  const fetchReadReceipts = useFetchReadReceipts();
  const [initialReadReceipts, setInitialReadReceipts] = useState(EMPTY_ARRAY);

  // Required for conversation history.
  useEffect(() => {
    const abortController = new AbortController();

    // eslint-disable-next-line wrap-iife
    (async function () {
      const now = Date.now();

      debug('Initial fetch started');

      const initialReadReceipts = await fetchReadReceipts();

      setInitialReadReceipts(initialReadReceipts && initialReadReceipts.length ? initialReadReceipts : EMPTY_ARRAY);

      if (abortController.signal.aborted) {
        return;
      }

      debug(
        [
          `Initial fetch done, took %c${Date.now() - now} ms%c for %c${initialReadReceipts.length}%c read receipts.`,
          ...styleConsole('green'),
          ...styleConsole('purple')
        ],
        [initialReadReceipts]
      );
    })();

    return () => abortController.abort();
  }, [fetchReadReceipts]);

  // Required for new incoming messages.
  useSubscribeReadReceipt();

  const newReceipts = useReceipts() || EMPTY_ARRAY;

  useDebugDeps({ initialReadReceipts, newReceipts }, 'useACSReadReceiptsWithFetchAndSubscribe');

  // TODO: If read receipt is not supported in this chat message or thread, it should pass undefined instead of empty array.
  const result = useMemo(() => {
    const result = [...initialReadReceipts, ...newReceipts];

    return result.length ? result : EMPTY_ARRAY;
  }, [initialReadReceipts, newReceipts]);

  return [useMapper<ACSReadReceipt, ACSReadReceipt>(result, PASSTHRU_FN)];
}
