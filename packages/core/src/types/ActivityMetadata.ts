import DeliveryStatus from './DeliveryStatus';
import ReadBy from './ReadBy';
import Who from './Who';

type ActivityMetadata = {
  avatarImage?: string;
  avatarInitials?: string;
  deliveryStatus?: DeliveryStatus;
  key: string;
  readBy?: ReadBy;
  senderName?: string;
  trackingNumber?: string;
  who?: Who;
};

export default ActivityMetadata;
