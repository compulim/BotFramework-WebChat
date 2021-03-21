// TODO: Will our end-developers interested in delivery reports?
//       The tracking number is already in the transcript.
import useWebChatActivitiesContext from './useWebChatActivitiesContext';

export default function useDeliveryReports() {
  return [useWebChatActivitiesContext().deliveryReports];
}
