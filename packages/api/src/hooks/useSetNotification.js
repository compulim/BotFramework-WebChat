import useWebChatNotificationContext from './internal/useWebChatNotificationContext';

export default function useSetNotification() {
  return useWebChatNotificationContext().setNotification;
}
