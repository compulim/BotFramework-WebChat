import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendTypingIndicator() {
  return [useWebChatAPIContext().sendTypingIndicator];
}
