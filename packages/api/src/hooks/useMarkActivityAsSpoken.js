import useSpeechContext from './internal/useSpeechContext';

export default function useMarkActivityAsSpoken() {
  return useSpeechContext().markActivityAsSpoken;
}
