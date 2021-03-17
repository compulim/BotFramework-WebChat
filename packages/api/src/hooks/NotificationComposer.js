import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import WebChatNotificationContext from './internal/WebChatNotificationContext';

const NotificationComposer = ({
  children,
  connectivityStatus,
  dismissNotification,
  notifications,
  setNotification
}) => {
  // TODO: It seems notifications can be something local to Web Chat too.
  //       For example, if chat adapter don't support notifications, end-dev should still able to call setNotification/dismissNotification.
  //       If chat adapter support, then we should merge the notifications from chat adapter, along with notifications by end-dev.
  const context = useMemo(
    () => ({
      connectivityStatus,
      dismissNotification,
      notifications,
      setNotification
    }),
    [connectivityStatus, dismissNotification, notifications, setNotification]
  );

  return <WebChatNotificationContext.Provider value={context}>{children}</WebChatNotificationContext.Provider>;
};

NotificationComposer.defaultProps = {
  children: undefined,
  connectivityStatus: 'connected',
  dismissNotification: undefined,
  notifications: [],
  setNotification: undefined
};

NotificationComposer.propTypes = {
  children: PropTypes.any,
  connectivityStatus: PropTypes.string,
  dismissNotification: PropTypes.func,
  notifications: PropTypes.array,
  setNotification: PropTypes.func
};

export default NotificationComposer;
