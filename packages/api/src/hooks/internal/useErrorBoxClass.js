import useAPIContext from './useAPIContext';

export default function useErrorBoxClass() {
  const { internalErrorBoxClass } = useAPIContext();

  return [internalErrorBoxClass];
}
