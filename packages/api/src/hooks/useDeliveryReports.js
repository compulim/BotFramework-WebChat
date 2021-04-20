import useActivitiesContext from './internal/useActivitiesContext';

export default function useDeliveryReports() {
  return [useActivitiesContext().deliveryReports];
}
