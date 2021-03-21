import { useSendTypingNotification as useACSSendTypingNotification } from '@azure/acs-ui-sdk';

export default function useEmitTypingIndicator(): () => void {
  const sendTypingNotification = useACSSendTypingNotification();

  return sendTypingNotification;
}
