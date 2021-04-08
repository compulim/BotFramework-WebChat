import { getMetadata } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';

import Activity from '../types/Activity';
import HonorReadReceiptsContext from '../contexts/HonorReadReceiptsContext';
import useActivities from '../hooks/useActivities';
import useReturnReadReceipt from '../hooks/useReturnReadReceipt';

// TODO: We should type "children" prop.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const HonorReadReceiptsComposer: FC<{ children: any }> = ({ children }) => {
  const [activities] = useActivities();
  const [honorReadReceipts, setRawHonorReadReceipts] = useState(true);
  const lastReadActivityKeyRef = useRef<string>();
  const returnReadReceipt = useReturnReadReceipt();

  const activitiesForCallbacksRef = useRef<Activity[]>();

  activitiesForCallbacksRef.current = activities;

  const returnReadReceiptForLastActivity = useCallback(() => {
    const { current: activities } = activitiesForCallbacksRef;

    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      const { key, who } = getMetadata(activity);

      if (who === 'others') {
        if (lastReadActivityKeyRef.current !== key) {
          returnReadReceipt(key);
          lastReadActivityKeyRef.current = key;
        }

        break;
      }
    }
  }, [activitiesForCallbacksRef, lastReadActivityKeyRef, returnReadReceipt]);

  useMemo(() => honorReadReceipts && returnReadReceiptForLastActivity(), [
    honorReadReceipts,
    returnReadReceiptForLastActivity
  ]);

  const setHonorReadReceipts = useCallback(
    (nextHonorReadReceipts: boolean) => {
      setRawHonorReadReceipts(nextHonorReadReceipts);

      nextHonorReadReceipts && returnReadReceiptForLastActivity();
    },
    [returnReadReceiptForLastActivity, setRawHonorReadReceipts]
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
