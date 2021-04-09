import PropTypes from 'prop-types';

type ConnectivityStatus = 'connecting' | 'connected' | 'fatal';

export default ConnectivityStatus;

export const ConnectivityStatusPropTypes = PropTypes.oneOf(['connecting', 'connected', 'fatal']);
