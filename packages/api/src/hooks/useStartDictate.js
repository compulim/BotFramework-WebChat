import useSpeechContext from './internal/useSpeechContext';

export default function useStartDictate() {
  return useSpeechContext().startSpeechRecognition;
}
