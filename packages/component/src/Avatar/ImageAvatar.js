import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CroppedImage from '../Utils/CroppedImage';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  '&.webchat__image-avatar .webchat__image-avatar__image': {
    width: '100%'
  }
};

const ImageAvatar = ({ image }) => {
  const [{ imageAvatar: imageAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    !!image && (
      <div className={classNames('webchat__image-avatar', rootClassName, imageAvatarStyleSet + '')}>
        <CroppedImage alt="" className="webchat__image-avatar__image" height="100%" src={image} width="100%" />
      </div>
    )
  );
};

ImageAvatar.propTypes = {
  image: PropTypes.string.isRequired
};

export default ImageAvatar;
