import useWebChatActivitiesContext from './internal/useWebChatActivitiesContext';

export default function useDeliveryReports() {
  return [useWebChatActivitiesContext().deliveryReports];
}
