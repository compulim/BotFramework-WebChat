import useSpeechContext from './internal/useSpeechContext';

export default function useDictateState() {
  return [useSpeechContext().speechRecognitionState];
}
