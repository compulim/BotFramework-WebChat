import useSpeechContext from './internal/useSpeechContext';

export default function useDictateInterims() {
  return [useSpeechContext().speechRecognitionInterims];
}
