import useAPIContext from './internal/useAPIContext';

export default function useGrammars() {
  return [useAPIContext().grammars];
}
