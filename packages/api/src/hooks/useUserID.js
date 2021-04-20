import useAPIContext from './internal/useAPIContext';

// TODO: Rename to "useUserId".
export default function useUserID() {
  return [useAPIContext().userId];
}
