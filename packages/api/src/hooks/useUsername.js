import useAPIContext from './internal/useAPIContext';

// TODO: Should we modify this hook to read from member list?
export default function useUsername() {
  return [useAPIContext().username];
}
