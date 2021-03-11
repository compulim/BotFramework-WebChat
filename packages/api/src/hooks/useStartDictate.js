import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useStartDictate() {
  return useWebChatSpeechContext().startSpeechRecognition;
}
