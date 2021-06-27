import AdaptiveCardInvokeResponse from '../types/AdaptiveCardInvokeResponse';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendInvoke(): (
  name: 'adaptiveCard/action',
  value?: any
) => Promise<AdaptiveCardInvokeResponse> {
  return useWebChatAPIContext().sendInvoke;
}
