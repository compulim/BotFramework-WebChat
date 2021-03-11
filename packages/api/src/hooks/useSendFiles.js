import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSendFiles() {
  return useWebChatInputContext().sendFiles;
}
