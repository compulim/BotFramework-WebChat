import useAPIContext from './internal/useAPIContext';

export default function useTrackDimension() {
  const { trackDimension } = useAPIContext();

  return trackDimension;
}
