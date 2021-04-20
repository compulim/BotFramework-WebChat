// TODO: Will our end-developers interested in delivery reports?
//       The tracking number is already in the transcript.
import useActivitiesContext from './useActivitiesContext';

export default function useDeliveryReports() {
  return [useActivitiesContext().deliveryReports];
}
