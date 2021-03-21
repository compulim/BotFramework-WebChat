import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import { ACSChatMessage } from '../types/ACSChatMessage';
import { WebChatActivity } from '../types/WebChatActivity';

import ActivitiesContext from '../contexts/ActivitiesContext';
import createACSMessageToWebChatActivityConverter from '../converters/createACSMessageToWebChatActivityConverter';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import useACSChatMessages from '../hooks/useACSChatMessages';
import useACSReadReceiptsWithFetchAndSubscribe from '../hooks/useACSReadReceiptsWithFetchAndSubscribe';
import useACSThreadId from '../hooks/useACSThreadId';
import useACSUserId from '../hooks/useACSUserId';
import useMapper from '../hooks/useMapper';
import useMemoAll from '../hooks/useMemoAll';

let debug;

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

  const makeTuple = useCallback(
    (chatMessage: ACSChatMessage, readBy: 'some' | 'all'): [ACSChatMessage, 'some' | 'all'] => [chatMessage, readBy],
    []
  );

  const entries = useMemoAll<[ACSChatMessage, 'some' | 'all'], [ACSChatMessage, 'some' | 'all'][]>(makeTuple, tuple => {
      // Instead of "numTotalReaders", use "numThreadMembers".
    const numTotalReaders = readOnEntries.length;

    return chatMessages.map(chatMessage => {
      const { createdOn } = chatMessage;
      const numReaders = readOnEntries.reduce((count, readOn) => (readOn >= +createdOn ? count + 1 : count), 0);
      const readBy = !numReaders ? undefined : numTotalReaders === numReaders ? 'all' : 'some';

      return tuple(chatMessage, readBy);
    });
  });

  const debugConversionsRef = useRef<
    { activity: WebChatActivity; chatMessage: ACSChatMessage; readBy?: 'some' | 'all' }[]
  >();

  debugConversionsRef.current = [];

  const convertToActivities = useMemo(() => {
    const convert = createACSMessageToWebChatActivityConverter({ threadId, userId });

    return ([chatMessage, readBy]: [ACSChatMessage, 'some' | 'all']) => {
      const activity = updateIn(convert(chatMessage), ['channelData', 'webchat:read-by'], () => readBy);

      debugConversionsRef.current.push({ activity, chatMessage, readBy });

      return activity;
    };
  }, [threadId, userId]);

  const activities = useMapper<[ACSChatMessage, 'some' | 'all'], WebChatActivity>(entries, convertToActivities);

  debugConversionsRef.current.length &&
    debug(
      [`%c${debugConversionsRef.current.length} conversions%c done.`, ...styleConsole('purple')],
      [{ conversions: debugConversionsRef.current }]
    );

  return <ActivitiesContext.Provider value={activities}>{children}</ActivitiesContext.Provider>;
};

ActivitiesComposer.defaultProps = {
  children: undefined
};

ActivitiesComposer.propTypes = {
  children: PropTypes.any
};

export default ActivitiesComposer;
