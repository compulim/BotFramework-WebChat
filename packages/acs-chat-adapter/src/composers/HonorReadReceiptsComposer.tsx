import { getMetadata } from 'botframework-webchat-core';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';

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

      const { key, who } = getMetadata(activity);

      if (who === 'others') {
        if (lastReadActivityKeyRef.current !== key) {
          returnReadReceipt(key);
          lastReadActivityKeyRef.current = key;
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
