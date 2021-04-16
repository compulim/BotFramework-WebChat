import { getMetadata } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useState } from 'react';

import HonorReadReceiptsContext from '../contexts/HonorReadReceiptsContext';
import useActivities from '../hooks/useActivities';
import useReturnReadReceipt from '../hooks/useReturnReadReceipt';

// TODO: We should type "children" prop.
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const HonorReadReceiptsComposer: FC<{ children: any }> = ({ children }) => {
  const [activities] = useActivities();
  const [honorReadReceipts, setHonorReadReceipts] = useState(true);
  const returnReadReceipt = useReturnReadReceipt();

  const lastActivityKeyFromOthersKey = useMemo(() => {
    for (let index = activities.length - 1; index >= 0; index--) {
      const activity = activities[index];

      const { key, who } = getMetadata(activity);

      if (who === 'others') {
        return key;
      }
    }
  }, [activities]);

  useMemo(() => honorReadReceipts && lastActivityKeyFromOthersKey && returnReadReceipt(lastActivityKeyFromOthersKey), [
    honorReadReceipts,
    lastActivityKeyFromOthersKey,
    returnReadReceipt
  ]);

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
