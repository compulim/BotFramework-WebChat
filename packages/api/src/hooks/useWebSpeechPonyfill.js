import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useWebSpeechPonyfill() {
  return [useWebChatSpeechContext().webSpeechPonyfill];
}
