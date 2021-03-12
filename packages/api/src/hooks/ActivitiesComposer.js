import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import getActivityKey from '../utils/getActivityKey';
import WebChatActivitiesContext from './internal/WebChatActivitiesContext';

const ActivitiesComposer = ({ children }) => {
  const [lastAcknowledgedActivityKey, setLastAcknowledgedActivityKey] = useState();
  const activities = useSelector(({ activities }) => activities);

  const acknowledgedActivities = useMemo(
    () => activities.filter(activity => getActivityKey(activity) >= lastAcknowledgedActivityKey),
    [activities, lastAcknowledgedActivityKey]
  );

  const context = useMemo(
    () => ({
      acknowledgedActivities,
      activities,
      lastAcknowledgedActivityKey,
      setLastAcknowledgedActivityKey
    }),
    [acknowledgedActivities, activities, lastAcknowledgedActivityKey, setLastAcknowledgedActivityKey]
  );

  return <WebChatActivitiesContext.Provider value={context}>{children}</WebChatActivitiesContext.Provider>;
};

ActivitiesComposer.defaultProps = {
  children: undefined
};

ActivitiesComposer.propTypes = {
  children: PropTypes.any
};

export default ActivitiesComposer;
