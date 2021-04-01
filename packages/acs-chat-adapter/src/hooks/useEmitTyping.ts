import { useSendTypingNotification as useACSSendTypingNotification } from '@azure/acs-ui-sdk';

export default function useEmitTyping(): () => void {
  const sendTypingNotification = useACSSendTypingNotification();

  return sendTypingNotification;
}
