import { WebChatActivity } from './WebChatActivity';
import { WebChatDeliveryReports } from './WebChatDeliveryReports';
import { WebChatNotification } from './WebChatNotification';
import { WebChatTypingUsers } from './WebChatTypingUsers';

export type ChatAdapter = {
  activities?: WebChatActivity[];
  deliveryReports?: WebChatDeliveryReports;
  emitTypingIndicator?: () => void;
  notifications?: WebChatNotification[];
  resend?: (trackingNumber: string) => string;
  returnReadReceipt?: () => void;
  sendMessage?: (message: string) => string;
  typingUsers?: WebChatTypingUsers;
  userId?: string;
  username?: string;
};
