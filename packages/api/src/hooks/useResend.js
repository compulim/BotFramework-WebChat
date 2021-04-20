import useInputContext from './internal/useInputContext';

export default function useResend() {
  return useInputContext().resend;
}
