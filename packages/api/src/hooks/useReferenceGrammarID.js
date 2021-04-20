import useSpeechContext from './internal/useSpeechContext';

export default function useReferenceGrammarID() {
  return [useSpeechContext().directLineReferenceGrammarId];
}
