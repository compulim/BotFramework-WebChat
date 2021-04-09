import PropTypes from 'prop-types';

type TextFormat = 'markdown' | 'plain' | 'xml';

export default TextFormat;

export const TextFormatPropTypes = PropTypes.oneOf(['markdown', 'plain', 'xml']) as PropTypes.Validator<TextFormat>;
