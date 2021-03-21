import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

import { ACSChatMessage } from '../types/ACSChatMessage';
import { WebChatActivity } from '../types/WebChatActivity';
import { WebChatDeliveryStatus } from '../types/WebChatDeliveryStatus';
import { WebChatReadBy } from '../types/WebChatReadBy';

import ActivitiesContext from '../contexts/ActivitiesContext';
import createACSMessageToWebChatActivityConverter from '../converters/createACSMessageToWebChatActivityConverter';
import createDebug from '../utils/debug';
import SendMessageContext from '../contexts/SendMessageContext';
import styleConsole from '../utils/styleConsole';
import useACSChatMessages from '../hooks/useACSChatMessages';
import useACSReadReceiptsWithFetchAndSubscribe from '../hooks/useACSReadReceiptsWithFetchAndSubscribe';
import useACSSendMessageWithStatus from '../hooks/useACSSendMessageWithStatus';
import useACSThreadId from '../hooks/useACSThreadId';
import useACSUserId from '../hooks/useACSUserId';
import useMapper from '../hooks/useMapper';
import useMemoAll from '../hooks/useMemoAll';

let debug;

function generateTrackingNumber(): string {
  return `t-${random().toString(36).substr(2, 10)}`;
}

const ActivitiesComposer: FC = ({ children }) => {
  debug || (debug = createDebug('<ActivitiesComposer>', { backgroundColor: 'orange' }));

  const [acsReadReceipts] = useACSReadReceiptsWithFetchAndSubscribe();
  const [chatMessages] = useACSChatMessages();
  const [threadId] = useACSThreadId();
  const [userId] = useACSUserId();

  // TODO: Merge with delivery report and add to `channelData['webchat:tracking-number']`.

  const readOnEntries = useMemo<number[]>(
    () =>
      Object.values(
        acsReadReceipts.reduce<{ [userId: string]: number }>((readReceipts, acsReadReceipt) => {
          const memberUserId = acsReadReceipt.sender.communicationUserId;

          // Do not count self for reader counter.
          if (memberUserId !== userId) {
            readReceipts[memberUserId] = Math.max(readReceipts[memberUserId] || 0, +acsReadReceipt.readOn);
          }

          return readReceipts;
        }, {})
      ),
    [acsReadReceipts]
  );

  const abortController = useMemo(() => new AbortController(), []);
  const acsSendMessageWithDelivery = useACSSendMessageWithStatus();

  useEffect(() => () => abortController.abort(), [abortController]);

  const [deliveryReports, setDeliveryReports] = useState<{
    [trackingNumber: string]: {
      clientMessageId: string;
      deliveryStatus: WebChatDeliveryStatus;
    };
  }>({});

  const sendMessageWithTrackingNumber = useCallback(
    (message: string) => {
      const trackingNumber = generateTrackingNumber();

      (async function () {
        let clientMessageId: string;

        try {
          clientMessageId = await acsSendMessageWithDelivery(message, clientMessageIdAtQueueTime => {
            if (abortController.signal.aborted) {
              return;
            }

            if (clientMessageId) {
              return debug(
                [
                  `🔥🔥🔥 %cASSERTION%c acsSendMessageWithDelivery() MUST NOT resolve before calling progressCallback()`,
                  ...styleConsole('red')
                ],
                [{ clientMessageIdAtDelivery: clientMessageId, clientMessageIdAtQueueTime, trackingNumber }]
              );
            }

            clientMessageId = clientMessageIdAtQueueTime;

            setDeliveryReports(deliveryReports => {
              deliveryReports = updateIn(deliveryReports, [trackingNumber, 'clientMessageId'], () => clientMessageId);

              return updateIn(deliveryReports, [trackingNumber, 'deliveryStatus'], () => 'sending');
            });
          });
        } catch (error) {
          if (abortController.signal.aborted) {
            return;
          }

          debug(['%cFailed to send message%c', ...styleConsole('red')], [{ error, message }]);

          setDeliveryReports(deliveryReports => {
            if (clientMessageId) {
              deliveryReports = updateIn(deliveryReports, [trackingNumber, 'clientMessageId'], () => clientMessageId);
            }

            return updateIn(deliveryReports, [trackingNumber, 'deliveryStatus'], () => 'error');
          });

          return;
        }

        if (abortController.signal.aborted) {
          return;
        }

        setDeliveryReports(deliveryReports =>
          updateIn(deliveryReports, [trackingNumber, 'deliveryStatus'], () => 'sent')
        );
      })();

      return trackingNumber;
    },
    [acsSendMessageWithDelivery, setDeliveryReports]
  );

  const makeTuple = useCallback(
    (
      chatMessage: ACSChatMessage,
      readBy: WebChatReadBy,
      deliveryStatus: WebChatDeliveryStatus,
      trackingNumber?: string
    ): [ACSChatMessage, WebChatReadBy, WebChatDeliveryStatus, string] => [
      chatMessage,
      readBy,
      deliveryStatus,
      trackingNumber
    ],
    []
  );

  const buildEntries = useCallback(
    tuple => {
      // Instead of "numTotalReaders", use "numThreadMembers".
      const numTotalReaders = readOnEntries.length;

      return chatMessages.map(chatMessage => {
        const { clientMessageId, createdOn } = chatMessage;
        const numReaders = readOnEntries.reduce((count, readOn) => (readOn >= +createdOn ? count + 1 : count), 0);
        const readBy: WebChatReadBy = !numReaders ? undefined : numTotalReaders === numReaders ? 'all' : 'some';

        // On ACS, if the message contains "clientMessageId", it is a message sent from the current session.
        // A message could have sender same as current user, but the message could be from another session (e.g. page navigation).

        let deliveryStatus;
        let trackingNumber;

        if (!!clientMessageId) {
          [trackingNumber, { deliveryStatus } = { deliveryStatus: undefined }] =
            Object.entries(deliveryReports).find(
              ([_, deliveryReport]) => deliveryReport.clientMessageId === clientMessageId
            ) || [];
        }

        return tuple(chatMessage, readBy, deliveryStatus, trackingNumber);
      });
    },
    [chatMessages, deliveryReports, readOnEntries]
  );

  // The "entries" array will be regenerated on every render loop.
  // The array will be used to construct the final Activity[] with all channel data attached.
  const entries = useMemoAll<
    [ACSChatMessage, WebChatReadBy, WebChatDeliveryStatus, string],
    [ACSChatMessage, WebChatReadBy, WebChatDeliveryStatus, string][]
  >(makeTuple, buildEntries);

  const debugConversionsRef = useRef<
    {
      activity: WebChatActivity;
      chatMessage: ACSChatMessage;
      deliveryStatus?: WebChatDeliveryStatus;
      readBy?: WebChatReadBy;
      trackingNumber?: string;
    }[]
  >();

  debugConversionsRef.current = [];

  const convertToActivities = useMemo(() => {
    const convert = createACSMessageToWebChatActivityConverter({ threadId, userId });

    return ([chatMessage, readBy, deliveryStatus, trackingNumber]: [
      ACSChatMessage,
      WebChatReadBy,
      WebChatDeliveryStatus,
      string
    ]) => {
      let activity = convert(chatMessage);

      activity = updateIn(activity, ['channelData', 'webchat:read-by'], () => readBy);

      if (deliveryStatus) {
        activity = updateIn(activity, ['channelData', 'webchat:delivery-status'], () => deliveryStatus);
      }

      if (trackingNumber) {
        activity = updateIn(activity, ['channelData', 'webchat:tracking-number'], () => trackingNumber);
      }

      debugConversionsRef.current.push({ activity, chatMessage, readBy, deliveryStatus, trackingNumber });

      return activity;
    };
  }, [threadId, userId]);

  const activities = useMapper<[ACSChatMessage, WebChatReadBy, WebChatDeliveryStatus, string], WebChatActivity>(
    entries,
    convertToActivities
  );

  debugConversionsRef.current.length &&
    debug(
      [`%c${debugConversionsRef.current.length} conversions%c done.`, ...styleConsole('purple')],
      [{ conversions: debugConversionsRef.current }]
    );

  return (
    <ActivitiesContext.Provider value={activities}>
      <SendMessageContext.Provider value={sendMessageWithTrackingNumber}>{children}</SendMessageContext.Provider>
    </ActivitiesContext.Provider>
  );
};

ActivitiesComposer.defaultProps = {
  children: undefined
};

ActivitiesComposer.propTypes = {
  children: PropTypes.any
};

export default ActivitiesComposer;
