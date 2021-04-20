import useInputContext from './internal/useInputContext';

export default function useSendBoxValue() {
  const { sendBoxValue, setSendBoxValue } = useInputContext();

  return [sendBoxValue, setSendBoxValue];
}
