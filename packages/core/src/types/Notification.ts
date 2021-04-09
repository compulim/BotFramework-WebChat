import PropTypes from 'prop-types';

import ConnectivityStatus, { ConnectivityStatusPropTypes } from './ConnectivityStatus';

type BaseNotification = {
  /** Localized screen reader text. */
  alt?: string;

  /** Raw data. */
  data?: any;

  /** Notification ID. */
  id: string;

  /** Notification level. */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  level?: 'error' | 'info' | 'success' | 'warn';

  /** Localized message. */
  message?: any;

  /** Epoch time when the notification is set. */
  // TODO: Should we remove "timestamp"? It was added by reducer on SET_NOTIFICATION.
  timestamp?: number;
};

type DataOnlyNotification = Omit<BaseNotification, 'data'> & {
  /** Raw data. */
  data: any;
};

type MessageNotification = Omit<BaseNotification, 'message'> & {
  /** Localized message. */
  message: string;
};

export type ConnectivityStatusNotification = Omit<DataOnlyNotification, 'data' | 'id'> & {
  data: ConnectivityStatus;
  id: 'connectivitystatus';
};

type Notification = ConnectivityStatusNotification | DataOnlyNotification | MessageNotification;

const ConnectivityStatusNotificationPropTypes = PropTypes.shape({
  alt: PropTypes.string,
  data: ConnectivityStatusPropTypes.isRequired,
  id: PropTypes.oneOf(['connectivitystatus']),
  level: PropTypes.oneOf(['error', 'info', 'success', 'warn']),
  message: PropTypes.string,
  timestamp: PropTypes.number
});

const DataOnlyNotificationPropTypes = PropTypes.shape({
  alt: PropTypes.string,
  data: PropTypes.any.isRequired,
  id: PropTypes.string.isRequired,
  level: PropTypes.oneOf(['error', 'info', 'success', 'warn']),
  message: PropTypes.string,
  timestamp: PropTypes.number
});

const MessageNotificationPropTypes = PropTypes.shape({
  alt: PropTypes.string,
  data: PropTypes.any,
  id: PropTypes.string.isRequired,
  level: PropTypes.oneOf(['error', 'info', 'success', 'warn']),
  message: PropTypes.string.isRequired,
  timestamp: PropTypes.number
});

export default Notification;

export const NotificationPropTypes = PropTypes.oneOfType([
  ConnectivityStatusNotificationPropTypes,
  DataOnlyNotificationPropTypes,
  MessageNotificationPropTypes
]) as PropTypes.Validator<Notification>;
