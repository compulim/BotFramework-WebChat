import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useClearSuggestedActions() {
  return useWebChatInputContext().clearSuggestedActions;
}
