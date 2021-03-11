import useWebChatInputContext from './internal/useWebChatInputContext';

export default function usePostActivity() {
  return useWebChatInputContext().postActivity;
}
