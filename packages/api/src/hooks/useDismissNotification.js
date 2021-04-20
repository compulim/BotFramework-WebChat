import useNotificationContext from './internal/useNotificationContext';

export default function useDismissNotification() {
  return useNotificationContext().dismissNotification;
}
