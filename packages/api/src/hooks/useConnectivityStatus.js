import useWebChatNotificationContext from './internal/useWebChatNotificationContext';

export default function useConnectivityStatus() {
  return [useWebChatNotificationContext().connectivityStatus];
}
