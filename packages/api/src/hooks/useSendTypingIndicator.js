import useWebChatTypingContext from './internal/useWebChatTypingContext';

export default function useSendTypingIndicator() {
  return [useWebChatTypingContext().sendTypingIndicator];
}
