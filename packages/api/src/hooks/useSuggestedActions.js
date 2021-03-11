import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSuggestedActions() {
  const { suggestedActionsRef } = useWebChatInputContext();

  return [suggestedActionsRef.current];
}
