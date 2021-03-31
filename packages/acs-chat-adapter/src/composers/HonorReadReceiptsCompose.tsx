import React, { FC, useCallback, useMemo, useRef, useState } from 'react';

import fromWho from '../utils/fromWho';
import getActivityKey from '../utils/getActivityKey';
import HonorReadReceiptsContext from '../contexts/HonorReadReceiptsContext';
import useActivities from '../hooks/useActivities';
import useReturnReadReceipt from '../hooks/useReturnReadReceipt';

const HonorReadReceiptsComposer: FC = ({ children }) => {
  const [activities] = useActivities();
  const [honorReadReceipts, setRawHonorReadReceipts] = useState(true);
  const lastReadActivityKeyRef = useRef<string>();
  const returnReadReceipt = useReturnReadReceipt();

  const returnReadReceiptForLastActivity = useCallback(() => {
    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      if (fromWho(activity) === 'others') {
        const activityKey = getActivityKey(activity);

        if (lastReadActivityKeyRef.current !== activityKey) {
          returnReadReceipt(activityKey);
          lastReadActivityKeyRef.current = activityKey;
        }

        break;
      }
    }
  }, [activities, honorReadReceipts, lastReadActivityKeyRef, returnReadReceipt]);

  useMemo(() => honorReadReceipts && returnReadReceiptForLastActivity(), [activities, honorReadReceipts]);

  const setHonorReadReceipts = useCallback(
    (nextHonorReadReceipts: boolean) => {
      setRawHonorReadReceipts(nextHonorReadReceipts);

      nextHonorReadReceipts && returnReadReceiptForLastActivity();
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

HonorReadReceiptsComposer.propTypes = {};

export default HonorReadReceiptsComposer;
