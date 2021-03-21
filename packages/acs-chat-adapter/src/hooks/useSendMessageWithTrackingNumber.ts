import { useContext } from 'react';

import DeliveryReportsContext from '../contexts/DeliveryReportsContext';

export default function useSendMessageWithTrackingNumber(): (message: string) => void {
  return useContext(DeliveryReportsContext).sendMessageWithTrackingNumber;
}
