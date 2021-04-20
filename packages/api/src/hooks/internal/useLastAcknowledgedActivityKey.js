import useActivitiesContext from './useActivitiesContext';

export default function useLastAcknowledgedActivityKey() {
  const { lastAcknowledgedActivityKey, setLastAcknowledgedActivityKey } = useActivitiesContext();

  return [lastAcknowledgedActivityKey, setLastAcknowledgedActivityKey];
}
