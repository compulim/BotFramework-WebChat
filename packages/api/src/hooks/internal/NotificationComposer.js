import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import WebChatNotificationContext from './WebChatNotificationContext';

const NotificationComposer = ({ chatAdapterNotifications, children }) => {
  const [dismissedChatAdapterNotifications, setDismissedChatAdapterNotifications] = useState([]);
  const [localNotifications, setLocalNotifications] = useState([]);

  // Perf: decoupling for callback
  const chatAdapterNotificationsForCallbacksRef = useRef();

  chatAdapterNotificationsForCallbacksRef.current = chatAdapterNotifications;

  const dismissChatAdapterNotification = useCallback(
    id => {
      const notification = chatAdapterNotificationsForCallbacksRef.current.find(notification => notification.id === id);

      notification &&
        setDismissedChatAdapterNotifications(dismissedChatAdapterNotifications => [
          ...dismissedChatAdapterNotifications.filter(dismissed =>
            chatAdapterNotificationsForCallbacksRef.current.find(
              chatAdapterNotification =>
                chatAdapterNotification.id === dismissed.id && chatAdapterNotification.timestamp === dismissed.timestamp
            )
          ),
          { id, timestamp: notification.timestamp }
        ]);
    },
    [chatAdapterNotificationsForCallbacksRef, setDismissedChatAdapterNotifications]
  );

  const dismissNotification = useCallback(
    id => {
      if (chatAdapterNotificationsForCallbacksRef.current.find(notification => notification.id === id)) {
        return dismissChatAdapterNotification(id);
      }

      setLocalNotifications(localNotifications =>
        localNotifications.filter(localNotification => localNotification.id !== id)
      );
    },
    [chatAdapterNotificationsForCallbacksRef, dismissChatAdapterNotification, setLocalNotifications]
  );

  const setNotification = useCallback(
    notification => {
      setLocalNotifications(localNotifications => [
        ...localNotifications.filter(localNotification => localNotification.id !== notification.id),
        localNotifications
      ]);
    },
    [setLocalNotifications]
  );

  const notifications = useMemo(
    () => [
      ...(chatAdapterNotifications || []).filter(
        chatAdapterNotification =>
          !dismissedChatAdapterNotifications.find(
            dismissedChatAdapterNotification =>
              chatAdapterNotification.id === dismissedChatAdapterNotification.id &&
              chatAdapterNotification.timestamp === dismissedChatAdapterNotification.timestamp
          )
      ),
      ...localNotifications
    ],
    [chatAdapterNotifications, dismissedChatAdapterNotifications, localNotifications]
  );

  const context = useMemo(
    () => ({
      dismissNotification,
      notifications,
      setNotification
    }),
    [dismissNotification, notifications, setNotification]
  );

  return <WebChatNotificationContext.Provider value={context}>{children}</WebChatNotificationContext.Provider>;
};

NotificationComposer.defaultProps = {
  chatAdapterNotifications: undefined,
  children: undefined
};

NotificationComposer.propTypes = {
  chatAdapterNotifications: PropTypes.arrayOf(
    PropTypes.shape({
      data: PropTypes.any,
      id: PropTypes.string,
      timestamp: PropTypes.number
    })
  ),
  children: PropTypes.any
};

export default NotificationComposer;
