import useInputContext from './internal/useInputContext';

export default function useSendMessageBack() {
  return useInputContext().sendMessageBack;
}
