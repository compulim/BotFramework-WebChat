import { ChatThreadClientState } from '@azure/acs-chat-declarative';
import { useCallback, useEffect } from 'react';

import createDebug from '../utils/debug';
import useForceRender from './useForceRender';
import useLazyRef from './useLazyRef';
import usePrevious from './usePrevious';
import warn from '../utils/warn';
import useACSDeclaratives from './useACSDeclaratives';
import styleConsole from '../utils/styleConsole';

let debug;

export default function useACSChatThreadSelector<T>(selector: (state: ChatThreadClientState) => T): T {
  debug || (debug = createDebug('useACSChatThreadSelector', { backgroundColor: 'cyan', color: 'black' }));

  const { declarativeChatClient, threadId } = useACSDeclaratives();
  const forceRender = useForceRender();

  const getValue = useCallback<() => T>(() => {
    const result = selector(declarativeChatClient.state.threads.get(threadId));

    // debug('getValue', {
    //   client: declarativeChatClient,
    //   state: declarativeChatClient.state,
    //   threadState: declarativeChatClient.state.threads.get(threadId),
    //   result
    // });

    return result;
  }, [declarativeChatClient, selector, threadId]);

  const prevGetValue = usePrevious(getValue);

  const valueRef = useLazyRef<T>(getValue);

  // If "declarativeChatClient" or "selector" changed, we should call getValue() again.
  if (getValue !== prevGetValue) {
    valueRef.current = getValue();
  }

  useEffect(() => {
    let disposed;

    const handler = () => {
      if (disposed) {
        return warn(
          '🔥🔥🔥 ASSERTION: useACSChatThreadSelector() has been unmounted, it should not receive DeclarativeChatClient.onStateChange.'
        );
      }

      const value = getValue();

      if (value !== valueRef.current) {
        valueRef.current = value;
        forceRender();
      }
    };

    debug(`Adding %cstateChange%c event listener`, ...styleConsole('green'));

    declarativeChatClient.onStateChange(handler);

    return () => {
      debug(`Removing %cstateChange%c event listener`, ...styleConsole('green'));

      disposed = true;
      declarativeChatClient.offStateChange(handler);
    };
  }, [declarativeChatClient, forceRender, getValue, valueRef]);

  return valueRef.current;
}
