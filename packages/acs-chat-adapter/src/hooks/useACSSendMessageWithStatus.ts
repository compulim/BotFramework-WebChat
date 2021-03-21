import { useCallback, useMemo, useRef } from 'react';
import createDeferred, { DeferredPromise } from 'p-defer';

import createCriticalSection from '../utils/createCriticalSection';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatMessages from './useACSChatMessages';
import useACSFailedClientMessageIds from './useACSFailedClientMessageIds';
import useACSSendMessage from './useACSSendMessage';
import usePrevious from './usePrevious';

let debug;

/**
 * Callback for receiving the client message ID of the message when queued. This ID is for local reference and may not be delivered to the provider.
 *
 * @callback ACSSendMessageWithStatusCallback
 * @param {string} clientMessageId - Client message ID of the message when queued.
 */

/**
 * Send a message with progress and delivery.
 *
 * @callback ACSSendMessageWithStatus
 * @param {string} message - Plain text message to send
 * @param {ACSSendMessageWithStatusCallback=} progressCallback - Callback to invoke after the message is queued and appears locally in the transcript. The "clientMessageId" is the local message ID.
 * @return {Promise<string>} Client message ID of the message delivered to the service.
 */

/**
 * Gets a function, when called, will send a message with progress and delivery.
 *
 * @return {ACSSendMessageWithStatus} A function to send a message with progress and delivery.
 */
export default function useACSSendMessageWithStatus(): (
  message: string,
  progressCallback?: (clientMessageId: string) => void
) => Promise<string> {
  debug || (debug = createDebug('useACSSendMessageWithStatus', { backgroundColor: 'yellow', color: 'black' }));

  const [chatMessages] = useACSChatMessages();
  const [failedClientMessageIds] = useACSFailedClientMessageIds();
  const acsSendMessage = useACSSendMessage();
  const criticalSection = useMemo(() => createCriticalSection<string>(), []);
  const pendingQueueRef = useRef<{
    content: string;
    promise: Promise<string>;
    resolve: (clientMessageId: string) => void;
  }>();

  const pendingDeliveredRef = useRef<{
    [clientMessageId: string]: DeferredPromise<string>;
  }>({});

  // Messages with "clientMessageId" means it is sending/sent from the current session.
  // There could be messages sent from self without "clientMessageId", for example, outgoing messages restored from conversation history.
  const outgoingMessages = useMemo(() => chatMessages.filter(({ clientMessageId }) => clientMessageId), [chatMessages]);
  const prevOutgoingMessages = usePrevious(outgoingMessages);

  if (prevOutgoingMessages !== outgoingMessages) {
    const updatedOutgoingMessages = outgoingMessages.filter(message => !prevOutgoingMessages.includes(message));

    if (pendingQueueRef.current) {
      // We are in "queue-time": find out the "clientMessageId" of the temporary/local outgoing message.
      const {
        current: { content, resolve }
      } = pendingQueueRef;

      const queuedMessage = updatedOutgoingMessages.find(
        outgoingMessage => outgoingMessage.content === content && outgoingMessage.clientMessageId
      );

      if (queuedMessage) {
        const { clientMessageId } = queuedMessage;

        resolve(clientMessageId);

        pendingDeliveredRef.current = { ...pendingDeliveredRef.current, [clientMessageId]: createDeferred() };
      }
    }

    Object.entries(pendingDeliveredRef.current).forEach(([clientMessageId, { resolve }]) => {
      updatedOutgoingMessages.find(
        outgoingMessage => outgoingMessage.clientMessageId === clientMessageId && outgoingMessage.createdOn
      ) && resolve();
    });
  }

  const prevFailedClientMessageIds = usePrevious(failedClientMessageIds);

  if (prevFailedClientMessageIds !== failedClientMessageIds) {
    Object.entries(pendingDeliveredRef.current).forEach(([clientMessageId, { reject }]) => {
      failedClientMessageIds.includes(clientMessageId) && reject(new Error('failed to send'));
    });
  }

  return useCallback(
    async (content: string, progressCallback: (clientMessageId: string) => void): Promise<string> => {
      debug([`Acquiring critical section with message %c${content}%c`, ...styleConsole('purple')], [{ content }]);

      let startAt;

      const clientMessageId = await criticalSection(async () => {
        startAt = Date.now();

        const { promise, resolve } = createDeferred<string>();

        pendingQueueRef.current = { content, promise, resolve };

        try {
          debug([`Sending message %c${content}%c`, ...styleConsole('purple')], [{ content }]);

          await acsSendMessage(content);

          const clientMessageIdAtQueueTime = await promise;

          debug(
            [
              `Message %c${content}%c is %cqueued%c, took %c${Date.now() - startAt} ms%c`,
              ...styleConsole('purple'),
              ...styleConsole('yellow', 'black'),
              ...styleConsole('green')
            ],
            [{ clientMessageId: clientMessageIdAtQueueTime, content, progressCallback }]
          );

          return clientMessageIdAtQueueTime;
        } finally {
          pendingQueueRef.current = undefined;
        }
      });

      progressCallback && progressCallback(clientMessageId);

      const { promise } = pendingDeliveredRef.current[clientMessageId] || {};

      !promise &&
        debug(
          [
            `🔥🔥🔥 %cASSERTION%c "pendingDeliveredRef" must be prepared immediately after the message is queued.`,
            ...styleConsole('red')
          ],
          [
            {
              clientMessageId,
              content,
              pendingDelivered: pendingDeliveredRef.current,
              pendingQueue: pendingQueueRef.current
            }
          ]
        );

      try {
        await promise;

        debug(
          [
            `Message %c${content}%c is %cdelivered%c, took %c${Date.now() - startAt} ms%c`,
            ...styleConsole('purple'),
            ...styleConsole('green'),
            ...styleConsole('green')
          ],
          [{ clientMessageId, content }]
        );

        return clientMessageId;
      } catch (error) {
        debug(
          [
            `%cFailed%c to deliver message %c${content}%c, took %c${Date.now() - startAt} ms%c`,
            ...styleConsole('red'),
            ...styleConsole('purple'),
            ...styleConsole('green')
          ],
          [{ clientMessageId, content, error }]
        );
      } finally {
        delete pendingDeliveredRef.current[clientMessageId];
      }
    },
    [acsSendMessage, criticalSection, pendingQueueRef]
  );
}
