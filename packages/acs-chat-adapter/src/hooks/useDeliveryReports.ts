import { useContext } from 'react';

import { WebChatDeliveryReports } from '../types/WebChatDeliveryReports';

import DeliveryReportsContext from '../contexts/DeliveryReportsContext';

export default function useDeliveryReports(): [WebChatDeliveryReports] {
  return [useContext(DeliveryReportsContext).deliveryReports];
}
