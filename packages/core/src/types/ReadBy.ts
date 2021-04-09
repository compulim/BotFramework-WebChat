import PropTypes from 'prop-types';

type ReadBy = 'some' | 'all';

export default ReadBy;

export const ReadByPropTypes = PropTypes.oneOf(['some', 'all']);
