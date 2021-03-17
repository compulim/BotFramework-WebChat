import { useSendTypingNotification as useACSSendTypingNotification } from '@azure/acs-ui-sdk';

export default function useEmitTypingIndicator() {
  const sendTypingNotification = useACSSendTypingNotification();

  return sendTypingNotification;
}
