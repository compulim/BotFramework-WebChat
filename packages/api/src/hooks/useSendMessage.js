import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSendMessage() {
  return useWebChatInputContext().sendMessage;
}
