import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useEmitTypingIndicator() {
  return useWebChatInputContext().emitTypingIndicator;
}
