import useNotificationContext from './internal/useNotificationContext';

export default function useNotifications() {
  return [useNotificationContext().notifications];
}
