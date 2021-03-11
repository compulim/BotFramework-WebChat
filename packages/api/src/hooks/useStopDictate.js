import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useStopDictate() {
  return useWebChatSpeechContext().stopSpeechRecognition;
}
