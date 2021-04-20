import useAPIContext from './useAPIContext';

export default function useLocalizedGlobalize() {
  return useAPIContext().localizedGlobalizeState;
}
