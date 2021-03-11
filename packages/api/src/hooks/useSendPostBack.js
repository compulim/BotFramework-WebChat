import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSendPostBack() {
  return useWebChatInputContext().sendPostBack;
}
