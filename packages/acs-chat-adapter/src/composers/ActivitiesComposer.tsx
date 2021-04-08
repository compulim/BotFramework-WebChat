import { updateMetadata } from 'botframework-webchat-core';
import AbortController from 'abort-controller-es5';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

import ACSChatMessage from '../types/ACSChatMessage';
import ActivitiesContext from '../contexts/ActivitiesContext';
import Activity from '../types/Activity';
import createACSMessageToWebChatActivityConverter from '../converters/createACSMessageToWebChatActivityConverter';
import createDebug from '../utils/debug';
import DeliveryStatus from '../types/DeliveryStatus';
import ReadBy from '../types/ReadBy';
import SendMessageContext from '../contexts/SendMessageContext';
import styleConsole from '../utils/styleConsole';
import useACSChatMessages from '../hooks/useACSChatMessages';
import useACSReadReceiptsWithFetchAndSubscribe from '../hooks/useACSReadReceiptsWithFetchAndSubscribe';
import useACSSendMessageWithStatus from '../hooks/useACSSendMessageWithStatus';
import useACSThreadId from '../hooks/useACSThreadId';
import useACSThreadMembers from '../hooks/useACSThreadMembers';
import useACSUserId from '../hooks/useACSUserId';
import useMapper from '../hooks/useMapper';
import useMemoAll from '../hooks/useMemoAll';
import UserProfiles from '../types/UserProfiles';

let debug;

type DeliveryReports = {
  [trackingNumber: string]: {
    clientMessageId: string;
    deliveryStatus: DeliveryStatus;
    message: string;
    resent?: true;
  };
};

function generateTrackingNumber(): string {
  return `t-${random().toString(36).substr(2, 10)}`;
}

const ActivitiesComposer: FC<{ userProfiles: UserProfiles }> = ({ children, userProfiles }) => {
  debug || (debug = createDebug('<ActivitiesComposer>', { backgroundColor: 'orange' }));

  const [acsReadReceipts] = useACSReadReceiptsWithFetchAndSubscribe();
  const [chatMessages] = useACSChatMessages();
  const [memberUserIds] = useACSThreadMembers();
  const [threadId] = useACSThreadId();
  const [userId] = useACSUserId();

  const { [userId]: { name: username } = { name: undefined } } = userProfiles;

  const numOtherUsers = useMemo(
    () => memberUserIds.filter(threadMember => threadMember.user.communicationUserId !== userId).length,
    [memberUserIds]
  );

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
  const acsSendMessageWithDelivery = useACSSendMessageWithStatus(username);

  useEffect(() => () => abortController.abort(), [abortController]);

  const [deliveryReports, setDeliveryReports] = useState<DeliveryReports>({});

  const sendMessageWithTrackingNumber = useCallback(
    (message: string) => {
      const trackingNumber = generateTrackingNumber();

      setDeliveryReports(deliveryReports => updateIn(deliveryReports, [trackingNumber, 'message'], () => message));

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

        setDeliveryReports(
          deliveryReports => updateIn(deliveryReports, [trackingNumber, 'deliveryStatus'], () => 'sent')
          // TODO: When testing retry, use the line below to inject error artificially.
          // updateIn(deliveryReports, [trackingNumber, 'deliveryStatus'], () => 'error')
        );
      })();

      return trackingNumber;
    },
    [acsSendMessageWithDelivery, setDeliveryReports]
  );

  // Perf: decouple for callbacks
  const deliveryReportsForCallbacksRef = useRef<DeliveryReports>();

  deliveryReportsForCallbacksRef.current = deliveryReports;

  const resend = useCallback(
    (trackingNumber: string) => {
      const deliveryReport = deliveryReportsForCallbacksRef.current[trackingNumber];

      if (!deliveryReport) {
        throw new Error(`Failed to resend, cannot find delivery with tracking number "${trackingNumber}".`);
      }

      // TODO: ACS should have a way to do resend. The resend should overwrite/remove the message that failed to send, while keeping the same "clientMessageId".
      setDeliveryReports(deliveryReports => updateIn(deliveryReports, [trackingNumber, 'resent'], () => true));

      return sendMessageWithTrackingNumber(deliveryReport.message);
    },
    [deliveryReportsForCallbacksRef, sendMessageWithTrackingNumber, setDeliveryReports]
  );

  const makeTuple = useCallback(
    (
      chatMessage: ACSChatMessage,
      readBy: ReadBy,
      deliveryStatus: DeliveryStatus,
      trackingNumber?: string
    ): [ACSChatMessage, ReadBy, DeliveryStatus, string] => [chatMessage, readBy, deliveryStatus, trackingNumber],
    []
  );

  const buildEntries = useCallback(
    tuple =>
      chatMessages.reduce((entries, chatMessage) => {
        const { clientMessageId, createdOn } = chatMessage;
        const numReaders = readOnEntries.reduce((count, readOn) => (readOn >= +createdOn ? count + 1 : count), 0);
        const readBy: ReadBy = !numReaders ? undefined : numOtherUsers === numReaders ? 'all' : 'some';

        // On ACS, if the message contains "clientMessageId", it is a message sent from the current session.
        // A message could have sender same as current user, but the message could be from another session (e.g. page navigation).

        let deliveryStatus;
        let resent;
        let trackingNumber;

        if (!!clientMessageId) {
          [trackingNumber, { deliveryStatus, resent } = { deliveryStatus: undefined, resent: undefined }] =
            Object.entries(deliveryReports).find(
              ([_, deliveryReport]) => deliveryReport.clientMessageId === clientMessageId
            ) || [];
        }

        // TODO: ACS should do resend internally so it don't create a new message on resend.
        //       Since ACS didn't implement it yet, internally, we will hide the one that is marked as resent.
        //       Since we hid the failed message, the resend message is a new one and will be appended to the transcript and may reorder it wrongly.
        resent || entries.push(tuple(chatMessage, readBy, deliveryStatus, trackingNumber));

        return entries;
      }, []),
    [chatMessages, deliveryReports, readOnEntries]
  );

  // The "entries" array will be regenerated on every render loop.
  // The array will be used to construct the final Activity[] with all channel data attached.
  const entries = useMemoAll<
    [ACSChatMessage, ReadBy, DeliveryStatus, string],
    [ACSChatMessage, ReadBy, DeliveryStatus, string][]
  >(makeTuple, buildEntries);

  const debugConversionsRef = useRef<
    {
      activity: Activity;
      chatMessage: ACSChatMessage;
      deliveryStatus?: DeliveryStatus;
      readBy?: ReadBy;
      trackingNumber?: string;
    }[]
  >();

  debugConversionsRef.current = [];

  const convertToActivities = useMemo(() => {
    const convert = createACSMessageToWebChatActivityConverter({ threadId, userId, userProfiles });

    return ([chatMessage, readBy, deliveryStatus, trackingNumber]: [
      ACSChatMessage,
      ReadBy,
      DeliveryStatus,
      string
    ]) => {
      let activity = convert(chatMessage);

      activity = updateMetadata(activity, {
        // If "deliveryStatus" is set to "undefined", "updateMetadata" will not touch/falsify this field.
        deliveryStatus: deliveryStatus || undefined,

        readBy,

        // If "trackingNumber" is set to "undefined", "updateMetadata" will not touch/falsify this field.
        trackingNumber: trackingNumber || undefined
      });

      debugConversionsRef.current.push({ activity, chatMessage, readBy, deliveryStatus, trackingNumber });

      return activity;
    };
  }, [threadId, userId, userProfiles]);

  const activities = useMapper<[ACSChatMessage, ReadBy, DeliveryStatus, string], Activity>(
    entries,
    convertToActivities
  );

  debugConversionsRef.current.length &&
    debug(
      [`%c${debugConversionsRef.current.length} conversions%c done.`, ...styleConsole('purple')],
      [{ conversions: debugConversionsRef.current }]
    );

  const sendMessageContext = useMemo(
    () => ({
      resend,
      sendMessage: sendMessageWithTrackingNumber
    }),
    [resend, sendMessageWithTrackingNumber]
  );

  return (
    <ActivitiesContext.Provider value={activities}>
      <SendMessageContext.Provider value={sendMessageContext}>{children}</SendMessageContext.Provider>
    </ActivitiesContext.Provider>
  );
};

ActivitiesComposer.defaultProps = {};

ActivitiesComposer.propTypes = {
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  ).isRequired
};

export default ActivitiesComposer;
