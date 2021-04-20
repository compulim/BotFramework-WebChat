import useInputContext from './internal/useInputContext';

export default function useSuggestedActions() {
  const { suggestedActionsRef } = useInputContext();

  return [suggestedActionsRef.current];
}
