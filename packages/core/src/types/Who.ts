import PropTypes from 'prop-types';

type Who = 'others' | 'self' | 'service';

export default Who;

export const WhoPropTypes = PropTypes.oneOf(['others', 'self', 'service']);
