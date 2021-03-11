import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useInputMode() {
  const { inputMode, setInputMode } = useWebChatInputContext();

  return [inputMode, setInputMode];
}
