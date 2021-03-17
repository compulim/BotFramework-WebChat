import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useReferenceGrammarID() {
  return [useWebChatSpeechContext().directLineReferenceGrammarId];
}
