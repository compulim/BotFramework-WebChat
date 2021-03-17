import { useCallback, useMemo, useRef } from 'react';
import createDeferred from 'p-defer';

import createCriticalSection from '../util/createCriticalSection';
import createDebug from '../util/debug';
import styleConsole from '../util/styleConsole';
import useACSChatMessagesWithFetchAndSubscribe from './useACSChatMessagesWithFetchAndSubscribe';
import useACSSendMessage from './useACSSendMessage';
import useMemoWithPrevious from './useMemoWithPrevious';

let debug;

function removeInline(array, element) {
  const index = array.indexOf(element);

  ~index && array.splice(index, 1);
}

export default function useACSSendMessageWithSendReceipt({ activities }) {
  debug || (debug = createDebug('useACSSendMessageWithSendReceipt', { backgroundColor: 'yellow', color: 'black' }));

  const acsSendMessage = useACSSendMessage();
  const criticalSection = useMemo(() => createCriticalSection(), []);
  const messages = useACSChatMessagesWithFetchAndSubscribe();
  const messagesRef = useRef();
  const sendPendingsRef = useRef([]);
  const sendReceiptPendingsRef = useRef([]);

  // Perf: for decoupling with useCallback()
  messagesRef.current = messages;

  useMemoWithPrevious(
    (prevOutgoingMessages = []) => {
      const outgoingMessages = messages.filter(({ clientMessageId }) => clientMessageId);
      const newOutgoingMessages = messages.filter(message => !prevOutgoingMessages.includes(message));
      const { current: pendings } = sendPendingsRef;

      for (const outgoingMessage of newOutgoingMessages) {
        const pending = pendings.find(({ content }) => content === outgoingMessage.content);

        pending && pending.resolve(outgoingMessage.clientMessageId);
      }

      return outgoingMessages;
    },
    [messages, sendPendingsRef]
  );

  useMemo(() => {
    for (const { clientMessageId, resolve } of sendReceiptPendingsRef.current) {
      const activity = activities.find(
        activity => ((activity.channelData || {})['acs:chat-message'] || {}).clientMessageId === clientMessageId
      );

      activity && resolve(activity);
    }
  }, [activities]);

  return useCallback(
    async content => {
      debug([`Pending critical section with message %c${content}%c`, ...styleConsole('purple')], [{ content }]);

      const clientMessageId = await criticalSection(async () => {
        debug([`Entered critical section with message %c${content}%c`, ...styleConsole('purple')], [{ content }]);

        const { promise, resolve } = createDeferred();
        const entry = { content, resolve };

        sendPendingsRef.current.push(entry);

        try {
          await acsSendMessage(content);

          return await promise;
        } finally {
          removeInline(sendPendingsRef.current, entry);
        }
      });

      debug([
        `Waiting for message %c${content}%c with client activity ID %c${clientMessageId}%c to be sent.`,
        ...styleConsole('purple'),
        ...styleConsole('purple')
      ]);

      const { promise, resolve } = createDeferred();

      const entry = { clientMessageId, resolve };

      sendReceiptPendingsRef.current.push(entry);

      try {
        const activity = await promise;

        debug(
          [`Message %c${content}%c successfully sent with send receipt.`, ...styleConsole('purple')],
          [{ activity, clientMessageId }]
        );

        return activity;
      } finally {
        removeInline(sendReceiptPendingsRef.current, entry);
      }
    },
    [acsSendMessage, criticalSection, sendPendingsRef, sendReceiptPendingsRef]
  );
}
