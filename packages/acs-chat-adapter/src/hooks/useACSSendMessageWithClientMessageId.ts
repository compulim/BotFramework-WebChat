import { useCallback, useMemo, useRef } from 'react';
import createDeferred from 'p-defer';

import createCriticalSection from '../util/createCriticalSection';
import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useACSChatMessages from './useACSChatMessages';
import useACSSendMessage from './useACSSendMessage';
import usePrevious from './usePrevious';

let debug;

export default function useACSSendMessageWithClientMessageId(): (message: string) => Promise<string> {
  debug || (debug = createDebug('useACSSendMessageWithClientMessageId', { backgroundColor: 'yellow', color: 'black' }));

  const [chatMessages] = useACSChatMessages();
  const acsSendMessage = useACSSendMessage();
  const criticalSection = useMemo(() => createCriticalSection<string>(), []);
  const pendingClientMessageIdRef = useRef<{ content: string; resolve: (clientMessageId: string) => void }>();

  const outgoingMessages = useMemo(() => chatMessages.filter(({ clientMessageId }) => clientMessageId), [chatMessages]);
  const prevOutgoingMessages = usePrevious(outgoingMessages);

  if (pendingClientMessageIdRef.current && prevOutgoingMessages !== outgoingMessages) {
    const newOutgoingMessages = outgoingMessages.filter(message => !prevOutgoingMessages.includes(message));

    const {
      current: { content, resolve }
    } = pendingClientMessageIdRef;

    const newOutgoingMessage = newOutgoingMessages.find(newOutgoingMessage => newOutgoingMessage.content === content);

    newOutgoingMessage && resolve(newOutgoingMessage.clientMessageId);
  }

  return useCallback(
    (content: string): Promise<string> => {
      debug([`Acquiring critical section with message %c${content}%c`, ...styleConsole('purple')], [{ content }]);

      return criticalSection(async () => {
        const { promise, resolve } = createDeferred<string>();

        pendingClientMessageIdRef.current = { content, resolve };

        try {
          const now = Date.now();

          debug([`Sending message %c${content}%c`, ...styleConsole('purple')], [{ content }]);

          await acsSendMessage(content);

          const clientMessageId = await promise;

          debug(
            [
              `Message %c${content}%c is sent, took %c${Date.now() - now} ms%c`,
              ...styleConsole('purple'),
              ...styleConsole('green')
            ],
            [{ clientMessageId, content }]
          );

          return clientMessageId;
        } finally {
          pendingClientMessageIdRef.current = undefined;
        }
      });
    },
    [acsSendMessage, criticalSection, pendingClientMessageIdRef]
  );
}
