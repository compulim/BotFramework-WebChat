import { getMetadata } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo, useState } from 'react';

import createDebug from '../utils/debug';
import HonorReadReceiptsContext from '../contexts/HonorReadReceiptsContext';
import styleConsole from '../utils/styleConsole';
import useACSSendReadReceipt from '../hooks/useACSSendReadReceipt';
import useActivities from '../hooks/useActivities';

let debug;

// TODO: We should type "children" prop.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const HonorReadReceiptsComposer: FC<{ children: any }> = ({ children }) => {
  debug || (debug = createDebug('HonorReadReceiptsComposer', { backgroundColor: 'yellow', color: 'black' }));

  const [activities] = useActivities();
  const [honorReadReceipts, setRawHonorReadReceipts] = useState(true);
  const acsSendReadReceipt = useACSSendReadReceipt();

  const lastChatMessageIdFromOthers = useMemo(() => {
    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      const { who } = getMetadata(activity);

      if (who === 'others') {
        return activity.channelData['acs:chat-message-id'];
      }
    }
  }, [activities]);

  useMemo(async () => {
    if (honorReadReceipts && lastChatMessageIdFromOthers) {
      const now = Date.now();

      await acsSendReadReceipt(lastChatMessageIdFromOthers);

      debug(
        `Read receipt returned for message %c${lastChatMessageIdFromOthers}%c, took %c${Date.now() - now} ms%c.`,
        ...styleConsole('purple'),
        ...styleConsole('green')
      );
    }
  }, [acsSendReadReceipt, honorReadReceipts, lastChatMessageIdFromOthers]);

  const setHonorReadReceipts = useCallback(
    nextHonorReadReceipts => {
      setRawHonorReadReceipts(nextHonorReadReceipts);

      debug(`Setting honor read receipts to %c${nextHonorReadReceipts}%c.`, ...styleConsole('green'));
    },
    [setRawHonorReadReceipts]
  );

  const honorReadReceiptsContext = useMemo<[boolean, (honorReadReceipts: boolean) => void]>(
    () => [honorReadReceipts, setHonorReadReceipts],
    [honorReadReceipts, setHonorReadReceipts]
  );

  return (
    <HonorReadReceiptsContext.Provider value={honorReadReceiptsContext}>{children}</HonorReadReceiptsContext.Provider>
  );
};

HonorReadReceiptsComposer.defaultProps = {};

HonorReadReceiptsComposer.propTypes = {
  children: PropTypes.any.isRequired
};

export default HonorReadReceiptsComposer;
