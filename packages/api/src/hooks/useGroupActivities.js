import useAPIContext from './internal/useAPIContext';

export default function useGroupActivities() {
  return useAPIContext().groupActivities;
}
