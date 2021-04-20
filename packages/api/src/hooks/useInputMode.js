import useInputContext from './internal/useInputContext';

export default function useInputMode() {
  const { inputMode, setInputMode } = useInputContext();

  return [inputMode, setInputMode];
}
