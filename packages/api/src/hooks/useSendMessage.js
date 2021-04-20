import useInputContext from './internal/useInputContext';

export default function useSendMessage() {
  return useInputContext().sendMessage;
}
