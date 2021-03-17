import useWebChatNotificationContext from './internal/useWebChatNotificationContext';

export default function useDismissNotification() {
  return useWebChatNotificationContext().dismissNotification;
}
