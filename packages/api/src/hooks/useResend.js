import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useResend() {
  return useWebChatInputContext().resend;
}
