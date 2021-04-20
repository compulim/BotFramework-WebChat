import useAPIContext from './useAPIContext';

export default function useDirFromProps() {
  return [useAPIContext().dir];
}
