import AbortController from 'abort-controller-es5';
import createDeferred from 'p-defer-es5';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ACSChatMessage from '../types/ACSChatMessage';
import createCriticalSection from '../utils/createCriticalSection';
import createDebug from '../utils/debug';
import diffMap from '../utils/diffMap';
import SendMessageContext from '../contexts/SendMessageContext';
import updateIn from 'simple-update-in';
import useACSChatMessages from '../hooks/useACSChatMessages';
import useACSClients from '../hooks/useACSClients';
import useACSUserId from '../hooks/useACSUserId';
import usePrevious from '../hooks/usePrevious';
import styleConsole from '../utils/styleConsole';

type Deferred<T> = {
  promise: Promise<T>;
  reject: (error: Error) => void;
  resolve: (value: T) => void;
};

function generateTrackingNumber() {
  // eslint-disable-next-line no-magic-numbers
  return `t-${random().toString(36).substr(2)}`;
}

let debug;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SendMessageWithResendComposer: FC<{ children: any }> = ({ children }) => {
  debug || (debug = createDebug('<SendMessageWithResendComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const [chatMessages] = useACSChatMessages();
  const [keyToTrackingNumber, setKeyToTrackingNumber] = useState<{ [key: string]: string }>({});
  const [userId] = useACSUserId();
  const { declarativeChatThreadClient } = useACSClients();
  const deliveryReportsRef = useRef<(Deferred<string> & { content: string; trackingNumber: string })[]>([]);

  const prevChatMessages = usePrevious<Map<string, ACSChatMessage>>(chatMessages);

  for (const [key, [, to]] of diffMap<string, ACSChatMessage>(
    prevChatMessages || new Map(),
    chatMessages || new Map()
  ).entries()) {
    if (!to) {
      continue;
    }

    for (const pending of deliveryReportsRef.current) {
      if (
        to.sender?.communicationUserId === userId &&
        to.content?.message === pending.content &&
        (to.type === 'text' || to.type === 'Text')
      ) {
        pending.resolve(key);
      }
    }
  }

  const sendMessage = useMemo(() => {
    const enterCriticalSection = createCriticalSection<void>();

    return (content: string) => {
      const trackingNumber = generateTrackingNumber();
      const queueTime = Date.now();

      enterCriticalSection(async () => {
        if (abortController.signal.aborted) {
          return;
        }

        const sendTime = Date.now();
        const { promise, reject, resolve }: Deferred<string> = createDeferred();

        deliveryReportsRef.current.push({ content, promise, reject, resolve, trackingNumber });

        const sent = declarativeChatThreadClient.sendMessage({ content });
        const key = await promise;

        abortController.signal.aborted ||
          setKeyToTrackingNumber(keyToTrackingNumber => updateIn(keyToTrackingNumber, [key], () => trackingNumber));

        await sent;

        abortController.signal.aborted ||
          setKeyToTrackingNumber(keyToTrackingNumber => updateIn(keyToTrackingNumber, [key]));

        debug(
          [
            `Message %c${content}%c has sent, took %c${sendTime - queueTime} ms%c to queue, and %c${
              Date.now() - sendTime
            } ms%c to send.`,
            ...styleConsole('purple'),
            ...styleConsole('green'),
            ...styleConsole('green')
          ],
          { content, trackingNumber }
        );
      });

      return trackingNumber;
    };
  }, [abortController, declarativeChatThreadClient, setKeyToTrackingNumber]);

  const resend = useCallback(
    (trackingNumber: string) => {
      for (const element of deliveryReportsRef.current) {
        if (element.trackingNumber === trackingNumber) {
          return sendMessage(element.content);
        }
      }

      throw new Error(`Cannot find activity with tracking number ${trackingNumber} to resend.`);
    },
    [deliveryReportsRef, sendMessage]
  );

  const context = useMemo(
    () => ({
      keyToTrackingNumber,
      resend,
      sendMessage
    }),
    [keyToTrackingNumber, resend, sendMessage]
  );

  return <SendMessageContext.Provider value={context}>{children}</SendMessageContext.Provider>;
};

SendMessageWithResendComposer.defaultProps = {
  children: undefined
};

SendMessageWithResendComposer.propTypes = {
  children: PropTypes.any
};

export default SendMessageWithResendComposer;
