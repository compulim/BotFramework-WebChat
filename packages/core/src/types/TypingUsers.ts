import PropTypes from 'prop-types';
import TypingUser, { TypingUserPropTypes } from './TypingUser';

type TypingUsers = {
  [userId: string]: TypingUser;
};

export default TypingUsers;

export const TypingUsersPropTypes = PropTypes.objectOf(TypingUserPropTypes) as PropTypes.Validator<TypingUsers>;
