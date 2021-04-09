import PropTypes from 'prop-types';

import DeliveryStatus, { DeliveryStatusPropTypes } from './DeliveryStatus';
import ReadBy, { ReadByPropTypes } from './ReadBy';
import Who, { WhoPropTypes } from './Who';

type ActivityMetadata = {
  avatarImage?: string;
  avatarInitials?: string;
  deliveryStatus?: DeliveryStatus;
  key: string;
  messageBackDisplayText?: string;
  messageSubType?: 'imBack' | 'messageBack' | 'postBack';
  readBy?: ReadBy;
  senderName?: string;
  trackingNumber?: string;
  who?: Who;
};

export default ActivityMetadata;

export const ActivityMetadataPropTypes = PropTypes.shape({
  avatarImage: PropTypes.string,
  avatarInitials: PropTypes.string,
  deliveryStatus: DeliveryStatusPropTypes,
  key: PropTypes.string.isRequired,
  messageBackDisplayText: PropTypes.string,
  messageSubType: PropTypes.oneOf(['imBack', 'messageBack', 'postBack']),
  readBy: ReadByPropTypes,
  senderName: PropTypes.string,
  trackingNumber: PropTypes.string,
  who: WhoPropTypes
}) as PropTypes.Validator<ActivityMetadata>;
