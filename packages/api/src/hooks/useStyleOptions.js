import useAPIContext from './internal/useAPIContext';

export default function useStyleOptions() {
  return [useAPIContext().styleOptions];
}
