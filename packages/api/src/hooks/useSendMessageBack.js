import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSendMessageBack() {
  return useWebChatInputContext().sendMessageBack;
}
