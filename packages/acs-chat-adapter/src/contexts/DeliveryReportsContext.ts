import { createContext } from 'react';

import { WebChatDeliveryReports } from '../types/WebChatDeliveryReports';

const context = createContext<{
  deliveryReports: WebChatDeliveryReports;
  sendMessageWithTrackingNumber: (message: string) => string;
}>(undefined);

context.displayName = 'ACSChatAdapter.DeliveryReportsContext';

export default context;
