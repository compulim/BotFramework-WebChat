import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  alignItems: 'center',
  display: 'flex',

  '& .webchat__initials-avatar__initials': {
    justifyContent: 'center'
  }
};

const InitialsAvatar = ({ initials, self }) => {
  const [{ initialsAvatar: initialsAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      className={classNames(
        'webchat__initials-avatar',
        {
          'webchat__initials-avatar--self': self
        },
        rootClassName,
        initialsAvatarStyleSet + ''
      )}
    >
      <div className="webchat__initials-avatar__initials">{initials}</div>
    </div>
  );
};

InitialsAvatar.propTypes = {
  initials: PropTypes.string.isRequired,
  self: PropTypes.bool.isRequired
};

export default InitialsAvatar;
