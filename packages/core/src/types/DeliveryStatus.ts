import PropTypes from 'prop-types';

type DeliveryStatus = 'error' | 'sending';

export default DeliveryStatus;

export const DeliveryStatusPropTypes = PropTypes.oneOf(['error', 'sending']) as PropTypes.Validator<DeliveryStatus>;
