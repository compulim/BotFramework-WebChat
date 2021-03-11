import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSendBoxValue() {
  const { sendBoxValue, setSendBoxValue } = useWebChatInputContext();

  return [sendBoxValue, setSendBoxValue];
}
