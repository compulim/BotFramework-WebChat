import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import createDebug from '../../utils/debug';
import styleConsole from '../../utils/styleConsole';
import useForceRender from './useForceRender';
import useMemoWithPrevious from './useMemoWithPrevious';
import WebChatNotificationContext from './WebChatNotificationContext';

let debug;

const NotificationComposer = ({ chatAdapterNotifications, children }) => {
  debug || (debug = createDebug('<NotificationComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const [localNotifications, setLocalNotifications] = useState({});
  const ourChatAdapterNotificationsRef = useRef({});
  const forceRender = useForceRender();

  useMemoWithPrevious(
    (prevChatAdapterNotifications = []) => {
      // Remove notifications that are deleted or modified.
      prevChatAdapterNotifications
        .filter(notification => !chatAdapterNotifications.includes(notification))
        .forEach(({ id }) => {
          const { [id]: _, ...ourChatAdapterNotifications } = ourChatAdapterNotificationsRef.current;

          ourChatAdapterNotificationsRef.current = ourChatAdapterNotifications;
        });

      // Add notifications that are added or modified.
      chatAdapterNotifications
        .filter(notification => !prevChatAdapterNotifications.includes(notification))
        .forEach(addedOrModifiedNotification => {
          ourChatAdapterNotificationsRef.current = {
            ...ourChatAdapterNotificationsRef.current,
            [addedOrModifiedNotification.id]: addedOrModifiedNotification
          };
        });

      return chatAdapterNotifications;
    },
    [chatAdapterNotifications, ourChatAdapterNotificationsRef]
  );

  const dismissChatAdapterNotification = useCallback(
    id => {
      // Delete notification with key "id".
      const { [id]: _, ...otherChatAdapterNotifications } = ourChatAdapterNotificationsRef.current;

      ourChatAdapterNotificationsRef.current = otherChatAdapterNotifications;
      forceRender();
    },
    [forceRender, ourChatAdapterNotificationsRef]
  );

  const dismissNotification = useCallback(
    id => {
      dismissChatAdapterNotification(id);

      setLocalNotifications(localNotifications => {
        // Delete notification with key "id".
        const { [id]: _, ...otherLocalNotifications } = localNotifications;

        return otherLocalNotifications;
      });
    },
    [dismissChatAdapterNotification, setLocalNotifications]
  );

  const setNotification = useCallback(
    ({ alt, data, id, level, message }) => {
      if (!id) {
        throw new Error('"id" must be specified');
      }

      setLocalNotifications(localNotifications => {
        const localNotification = localNotifications[id];

        if (
          !localNotification ||
          alt !== localNotification.alt ||
          !Object.is(data, localNotification.data) ||
          level !== localNotification.level ||
          message !== localNotification.message
        ) {
          localNotifications = {
            ...localNotifications,
            id: {
              alt,
              data,
              id,
              level,
              message,
              timestamp: Date.now()
            }
          };
        }

        return localNotifications;
      });
    },
    [setLocalNotifications]
  );

  const notifications = useMemo(() => ({ ...ourChatAdapterNotificationsRef.current, ...localNotifications }), [
    localNotifications,
    ourChatAdapterNotificationsRef.current
  ]);

  debug(
    [`Render with %c${Object.keys(notifications).length} notifications%c`, ...styleConsole('purple')],
    [{ chatAdapterNotifications, localNotifications, notifications, ourChatAdapterNotificationsRef }]
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
