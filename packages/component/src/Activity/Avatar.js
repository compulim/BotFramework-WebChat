import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

import { DefaultAvatar } from '../Middleware/Avatar/createCoreMiddleware';

const { useStyleOptions } = hooks;

const Avatar = ({ 'aria-hidden': ariaHidden, className, fromUser }) => {
  console.warn(
    'botframework-webchat: <Avatar> component is deprecated and will be removed on or after 2022-02-25. Please use `useRenderAvatar` hook instead.'
  );

  const [{ botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials }] = useStyleOptions();

  return (
    <DefaultAvatar
      aria-hidden={ariaHidden}
      className={className}
      image={fromUser ? userAvatarImage : botAvatarImage}
      initials={fromUser ? userAvatarInitials : botAvatarInitials}
      who={fromUser ? 'self' : 'others'}
    />
  );
};

Avatar.defaultProps = {
  'aria-hidden': false,
  className: '',
  fromUser: false
};

Avatar.propTypes = {
  'aria-hidden': PropTypes.bool,
  className: PropTypes.string,
  fromUser: PropTypes.bool
};

export default Avatar;
