import useWebChatCardActionContext from './internal/useWebChatCardActionContext';

export default function usePerformCardAction() {
  return useWebChatCardActionContext().onCardAction;
}
