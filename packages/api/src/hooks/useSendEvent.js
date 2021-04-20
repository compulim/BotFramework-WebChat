import useInputContext from './internal/useInputContext';

export default function useSendEvent() {
  return useInputContext().sendEvent;
}
