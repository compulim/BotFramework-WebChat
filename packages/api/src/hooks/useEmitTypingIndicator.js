import useWebChatTypingContext from './internal/useWebChatTypingContext';

export default function useEmitTypingIndicator() {
  return useWebChatTypingContext().emitTypingIndicator;
}
