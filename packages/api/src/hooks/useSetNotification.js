import useNotificationContext from './internal/useNotificationContext';

export default function useSetNotification() {
  return useNotificationContext().setNotification;
}
