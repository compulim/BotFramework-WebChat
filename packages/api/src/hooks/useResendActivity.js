import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useResendActivity() {
  return useWebChatInputContext().resendActivity;
}
