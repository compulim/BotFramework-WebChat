import useWebChatInputContext from './internal/useWebChatInputContext';

export default function usePostActivity() {
  // TODO: Add deprecation warning, replace with "useSendMessage", "useSendEvent", instead.
  //       This feature will not work in ACS chat adapter.
  return useWebChatInputContext().postActivity;
}
