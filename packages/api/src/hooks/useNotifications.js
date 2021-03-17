import useWebChatNotificationContext from './internal/useWebChatNotificationContext';

export default function useNotifications() {
  return [useWebChatNotificationContext().notifications];
}
