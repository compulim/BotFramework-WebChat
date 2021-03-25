import { getMetadata } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ImageAvatar from '../../Avatar/ImageAvatar';
import InitialsAvatar from '../../Avatar/InitialsAvatar';
import useStyleSet from '../../hooks/useStyleSet';
import useStyleToEmotionObject from '../../hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  overflow: 'hidden',
  position: 'relative',

  '> *': {
    left: 0,
    position: 'absolute',
    top: 0
  }
};

const DefaultAvatar = ({ 'aria-hidden': ariaHidden, className, image, initials, who }) => {
  const [{ avatar: avatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const self = who === 'self';

  return (
    <div
      aria-hidden={ariaHidden}
      className={classNames('webchat__default-avatar', rootClassName, avatarStyleSet + '', (className || '') + '')}
    >
      {!!initials && <InitialsAvatar initials={initials} self={self} />}
      {!!image && <ImageAvatar image={image} />}
    </div>
  );
};

DefaultAvatar.defaultProps = {
  'aria-hidden': true,
  className: '',
  image: '',
  initials: ''
};

DefaultAvatar.propTypes = {
  'aria-hidden': PropTypes.bool,
  className: PropTypes.string,
  image: PropTypes.string,
  initials: PropTypes.string,
  who: PropTypes.oneOf(['others', 'self', 'service']).isRequired
};

export default function createCoreAvatarMiddleware() {
  return [
    () => () => ({ activity }) => {
      const { avatarImage, avatarInitials, who } = getMetadata(activity);

      if (avatarImage || avatarInitials) {
        // The next line is not a React component, but a callback function.
        // eslint-disable-next-line react/display-name
        return () => <DefaultAvatar image={avatarImage} initials={avatarInitials} who={who} />;
      }

      return false;
    }
  ];
}

export { DefaultAvatar };
