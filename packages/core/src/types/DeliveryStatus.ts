import PropTypes from 'prop-types';

type DeliveryStatus = 'error' | 'sending' | 'sent';

export default DeliveryStatus;

export const DeliveryStatusPropTypes = PropTypes.oneOf(['error', 'sending', 'sent']) as PropTypes.Validator<
  DeliveryStatus
>;
