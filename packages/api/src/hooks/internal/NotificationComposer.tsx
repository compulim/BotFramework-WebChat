import { Notifications, PropTypes as WebChatPropTypes, warn } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import updateIn from 'simple-update-in';

import createDebug from '../../utils/debug';
import diffObject from '../../utils/diffObject';
import useForceRender from './useForceRender';
import usePrevious from './usePrevious';
import WebChatNotificationContext from './WebChatNotificationContext';

let debug;

const NotificationComposer: FC<{ chatAdapterNotifications: Notifications; children: any }> = ({
  chatAdapterNotifications,
  children
}) => {
  debug || (debug = createDebug('<NotificationComposer>', { backgroundColor: 'yellow', color: 'black' }));

  const notificationsWithMismatchId = Object.entries(chatAdapterNotifications).filter(
    ([id, { id: idInNotification }]) => id !== idInNotification
  );

  notificationsWithMismatchId.length &&
    warn('🔥🔥🔥 "id" field in element must match the key in "notifications" map.', { notificationsWithMismatchId });

  const [localNotifications, setLocalNotifications] = useState<Notifications>({});
  const forceRender = useForceRender();
  const ourChatAdapterNotificationsRef = useRef<Notifications>({});
  const prevChatAdapterNotifications = usePrevious(chatAdapterNotifications) || {};

  let { current: nextOurChatAdapterNotifications } = ourChatAdapterNotificationsRef;

  Object.entries(diffObject(prevChatAdapterNotifications, chatAdapterNotifications)).forEach(([id, [, to]]) => {
    if (to) {
      nextOurChatAdapterNotifications = updateIn(nextOurChatAdapterNotifications, [id], () =>
        // Make sure the "id" field in the notification is set and is same as the key.
        updateIn(to, ['id'], () => id)
      );
    } else {
      nextOurChatAdapterNotifications = updateIn(nextOurChatAdapterNotifications, [id]);
    }
  });

  ourChatAdapterNotificationsRef.current = nextOurChatAdapterNotifications;

  const dismissNotification = useCallback(
    id => {
      const nextOurChatAdapterNotifications = updateIn(ourChatAdapterNotificationsRef.current, [id]);

      if (nextOurChatAdapterNotifications !== ourChatAdapterNotificationsRef.current) {
        ourChatAdapterNotificationsRef.current = nextOurChatAdapterNotifications;
        forceRender();
      }

      setLocalNotifications(localNotifications => updateIn(localNotifications, [id]));
    },
    [forceRender, ourChatAdapterNotificationsRef, setLocalNotifications]
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

  const { current: ourChatAdapterNotifications } = ourChatAdapterNotificationsRef;

  const notifications = useMemo(() => ({ ...ourChatAdapterNotifications, ...localNotifications }), [
    localNotifications,
    ourChatAdapterNotifications
  ]);

  // debug(
  //   [`Render with %c${Object.keys(notifications).length} notifications%c`, ...styleConsole('purple')],
  //   [{ chatAdapterNotifications, localNotifications, notifications, ourChatAdapterNotificationsRef }]
  // );

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
  chatAdapterNotifications: WebChatPropTypes.Notifications,
  children: PropTypes.any
};

export default NotificationComposer;
