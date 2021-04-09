import Notification, { ConnectivityStatusNotification, NotificationPropTypes } from './Notification';
import PropTypes from 'prop-types';

type Notifications = {
  [id: string]: Notification;
  connectivitystatus?: ConnectivityStatusNotification;
};

export default Notifications;

export const NotificationsPropTypes = PropTypes.objectOf(NotificationPropTypes) as PropTypes.Validator<Notifications>;
