import AbortController from 'abort-controller-es5';
import createDeferred from 'p-defer-es5';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ACSChatMessage from '../types/ACSChatMessage';
import diffMap from '../utils/diffMap';
import SendMessageContext from '../contexts/SendMessageContext2';
import useACSChatMessages from '../hooks/useACSChatMessages';
import useACSClients from '../hooks/useACSClients';
import useACSUserId from '../hooks/useACSUserId';
import usePrevious from '../hooks/usePrevious';
import updateIn from 'simple-update-in';

type Deferred<T> = {
  promise: Promise<T>;
  reject: (error: Error) => void;
  resolve: (value: T) => void;
};

function generateTrackingNumber() {
  // eslint-disable-next-line no-magic-numbers
  return `t-${random().toString(36).substr(2)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SendMessageComposer: FC<{ children: any }> = ({ children }) => {
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

  const sendMessage = useCallback(
    (content: string) => {
      const trackingNumber = generateTrackingNumber();

      // ESLint conflict with Prettier
      // eslint-disable-next-line wrap-iife
      (async function () {
        // TODO: We should set up a critical section on this async function.
        const { promise, reject, resolve }: Deferred<string> = createDeferred();

        deliveryReportsRef.current.push({ content, promise, reject, resolve, trackingNumber });

        const sent = declarativeChatThreadClient.sendMessage({ content });

        const key = await promise;

        setKeyToTrackingNumber(keyToTrackingNumber => updateIn(keyToTrackingNumber, [key], () => trackingNumber));

        await sent;

        setKeyToTrackingNumber(keyToTrackingNumber => updateIn(keyToTrackingNumber, [key]));
      })();

      return trackingNumber;
    },
    [declarativeChatThreadClient, setKeyToTrackingNumber]
  );

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

SendMessageComposer.defaultProps = {
  children: undefined
};

SendMessageComposer.propTypes = {
  children: PropTypes.any
};

export default SendMessageComposer;
