import useCardActionContext from './internal/useCardActionContext';

export default function usePerformCardAction() {
  return useCardActionContext().onCardAction;
}
