import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useDictateState() {
  return [useWebChatSpeechContext().speechRecognitionState];
}
