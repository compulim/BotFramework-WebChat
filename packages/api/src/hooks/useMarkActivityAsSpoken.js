import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useMarkActivityAsSpoken() {
  return useWebChatSpeechContext().markActivityAsSpoken;
}
