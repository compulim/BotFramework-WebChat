import useSpeechContext from './internal/useSpeechContext';

export default function useStopDictate() {
  return useSpeechContext().stopSpeechRecognition;
}
