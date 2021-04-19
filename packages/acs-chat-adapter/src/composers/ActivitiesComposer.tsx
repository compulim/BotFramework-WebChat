/* eslint no-magic-numbers: ["error", { "ignore": [-1, 0, 1] }] */

import { ReadBy, updateMetadata } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import ACSChatMessage from '../types/ACSChatMessage';
import ActivitiesContext from '../contexts/ActivitiesContext';
import createACSMessageToWebChatActivityConverter from '../converters/createACSMessageToWebChatActivityConverter';
import diffMap from '../utils/diffMap';
import useACSChatMessages from '../hooks/useACSChatMessages';
import useACSParticipants from '../hooks/useACSParticipants';
import useACSReadReceipts from '../hooks/useACSReadReceipts';
import useACSThreadId from '../hooks/useACSThreadId';
import useACSUserId from '../hooks/useACSUserId';
import useDebugDeps from '../hooks/useDebugDeps';
import useKeyToTrackingNumber from '../hooks/useKeyToTrackingNumber';
import usePrevious from '../hooks/usePrevious';
import UserProfiles from '../types/UserProfiles';

let EMPTY_MAP;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActivitiesComposer2: FC<{ children: any; userProfiles: UserProfiles }> = ({ children, userProfiles }) => {
  EMPTY_MAP || (EMPTY_MAP = new Map());

  const [chatMessages] = useACSChatMessages();
  const [keyToTrackingNumber] = useKeyToTrackingNumber();
  const [participants] = useACSParticipants();
  const [readReceipts] = useACSReadReceipts();
  const [threadId] = useACSThreadId();
  const [userId] = useACSUserId();
  const entriesRef = useRef<{
    [id: string]: { chatMessage: ACSChatMessage; readBy: ReadBy; sequenceNumber: number; trackingNumber: string };
  }>({});

  const convert = useMemo(() => createACSMessageToWebChatActivityConverter({ threadId, userId, userProfiles }), [
    threadId,
    userId,
    userProfiles
  ]);
  const numParticipant = useMemo(() => participants?.size || 0, [participants]);
  const prevChatMessages = usePrevious(chatMessages);
  let { current: nextEntries } = entriesRef;

  if (prevChatMessages !== chatMessages) {
    for (const [key, [, to]] of diffMap<string, ACSChatMessage>(
      prevChatMessages || EMPTY_MAP,
      chatMessages || EMPTY_MAP
    ).entries()) {
      if (!to) {
        nextEntries = updateIn(nextEntries, [key]);
      } else {
        const { sequenceId } = to;

        nextEntries = updateIn(nextEntries, [key, 'chatMessage'], () => to);
        nextEntries = updateIn(nextEntries, [key, 'sequenceNumber'], () =>
          typeof sequenceId === 'number'
            ? sequenceId
            : typeof sequenceId === 'string' && sequenceId
            ? +sequenceId
            : Infinity
        );
      }
    }
  }

  const otherReadOns = useMemo(
    () =>
      readReceipts.reduce<{ [userId: string]: number }>((otherReadOns, { readOn, sender }) => {
        if (sender?.communicationUserId && sender?.communicationUserId !== userId) {
          otherReadOns[sender.communicationUserId] = Math.max(otherReadOns[sender.communicationUserId] || 0, +readOn);
        }

        return otherReadOns;
      }, {}),
    [readReceipts]
  );

  const prevOtherReadOns = usePrevious(otherReadOns);
  const prevNumParticipant = usePrevious(numParticipant);

  if (prevOtherReadOns !== otherReadOns || prevNumParticipant !== numParticipant) {
    for (const [
      key,
      {
        chatMessage: { createdOn }
      }
    ] of Object.entries(nextEntries)) {
      const numOtherReader = Object.values(otherReadOns).filter(readOn => readOn >= +createdOn).length;
      const readBy = !numOtherReader ? undefined : numOtherReader === numParticipant ? 'all' : 'some';

      nextEntries = updateIn(nextEntries, [key, 'readBy'], readBy && (() => readBy));
    }
  }

  const prevKeyToTrackingNumber = usePrevious(keyToTrackingNumber);

  if (prevKeyToTrackingNumber !== keyToTrackingNumber) {
    for (const key of Object.keys(nextEntries)) {
      const trackingNumber = keyToTrackingNumber[key];

      nextEntries = updateIn(nextEntries, [key, 'trackingNumber'], trackingNumber && (() => trackingNumber));
    }
  }

  const activities = useMemo(
    () =>
      Object.entries(nextEntries)
        .sort(
          (
            [
              ,
              {
                chatMessage: { createdOn: createdOnX },
                sequenceNumber: sequenceNumberX
              }
            ],
            [
              ,
              {
                chatMessage: { createdOn: createdOnY },
                sequenceNumber: sequenceNumberY
              }
            ]
          ) =>
            sequenceNumberX > sequenceNumberY
              ? 1
              : sequenceNumberX < sequenceNumberY
              ? -1
              : createdOnX > createdOnY
              ? 1
              : createdOnX < createdOnY
              ? -1
              : 0
        )
        .map(([key, { chatMessage, readBy, trackingNumber }]) =>
          updateMetadata(convert(chatMessage), {
            key,
            readBy,
            trackingNumber
          })
        ),
    [convert, nextEntries]
  );

  // TODO: Remove this.
  useDebugDeps(
    {
      chatMessages,
      keyToTrackingNumber,
      nextEntries,
      numParticipant,
      prevChatMessages,
      readReceipts
    },
    'ActivitiesComposer'
  );

  if (nextEntries !== entriesRef.current) {
    entriesRef.current = nextEntries;
  }

  return <ActivitiesContext.Provider value={activities}>{children}</ActivitiesContext.Provider>;
};

ActivitiesComposer2.defaultProps = {
  children: undefined,
  userProfiles: undefined
};

ActivitiesComposer2.propTypes = {
  children: PropTypes.any,
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  )
};

export default ActivitiesComposer2;
