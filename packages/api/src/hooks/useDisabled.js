import useAPIContext from './internal/useAPIContext';

export default function useDisabled() {
  return [useAPIContext().disabled];
}
