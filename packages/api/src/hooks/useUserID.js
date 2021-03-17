import useWebChatAPIContext from './internal/useWebChatAPIContext';

// TODO: Rename to "useUserId".
export default function useUserID() {
  return [useWebChatAPIContext().userId];
}
