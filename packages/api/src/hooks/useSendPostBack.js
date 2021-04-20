import useInputContext from './internal/useInputContext';

export default function useSendPostBack() {
  return useInputContext().sendPostBack;
}
