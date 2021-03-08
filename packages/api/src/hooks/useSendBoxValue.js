import useWebChatSendBoxContext from './internal/useWebChatSendBoxContext';

export default function useSendBoxValue() {
  const { sendBoxValue, setSendBoxValue } = useWebChatSendBoxContext();

  return [sendBoxValue, setSendBoxValue];
}
