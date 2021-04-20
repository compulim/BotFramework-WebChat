import useInputContext from './internal/useInputContext';

export default function useClearSuggestedActions() {
  return useInputContext().clearSuggestedActions;
}
