import useWebChatAPIContext from './internal/useWebChatAPIContext';

// TODO: Should we modify this hook to read from member list?
export default function useUsername() {
  return [useWebChatAPIContext().username];
}
