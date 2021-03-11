import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useDictateInterims() {
  return [useWebChatSpeechContext().speechRecognitionInterims];
}
