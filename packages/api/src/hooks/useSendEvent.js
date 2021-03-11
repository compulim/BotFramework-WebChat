import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSendEvent() {
  return useWebChatInputContext().sendEvent;
}
