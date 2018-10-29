import { css } from 'glamor';
import classNames from 'classnames';
import memoize from 'memoize-one';
import React from 'react';

const ROOT_CSS = css({
  overflow: 'hidden',
  position: 'relative',

  // TODO: [P2] Prefer "cover" over "contains"
  '& > img': {
    height: '100%',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'auto'
  }
});

export default class Bubble extends React.Component {
  constructor(props) {
    super(props);

    this.createSizeStyle = memoize((width, height) => ({
      height,
      width
    }));
  }

  render() {
    const { props: { alt, className, height, src, width } } = this;
    const sizeStyle = this.createSizeStyle(width, height);

    return (
      <div
        className={ classNames(ROOT_CSS + '', (className || '') + '') }
        style={ sizeStyle }
      >
        <img
          alt={ alt }
          src={ src }
        />
      </div>
    );
  }
}
