/* eslint react/prop-types: "off"*/

import React from 'react';

import DotTypingIndicator from './DotTypingIndicator';
import TextTypingIndicator from './TextTypingIndicator';

export default function createTypingIndicatorMiddleware() {
  return [
    () => () => ({ activeTyping, styleOptions }) =>
      !!Object.keys(activeTyping).length &&
      (styleOptions.typingIndicatorStyle === 'dot'
        ? () => <DotTypingIndicator />
        : () => <TextTypingIndicator activeTyping={activeTyping} />)
  ];
}
