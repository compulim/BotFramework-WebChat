import useSpeechContext from './internal/useSpeechContext';

export default function useWebSpeechPonyfill() {
  return [useSpeechContext().webSpeechPonyfill];
}
