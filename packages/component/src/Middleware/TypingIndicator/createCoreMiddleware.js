/* eslint react/prop-types: "off"*/

import React from 'react';

import DotTypingIndicator from './DotTypingIndicator';
import TextTypingIndicator from './TextTypingIndicator';

export default function createTypingIndicatorMiddleware() {
  return [
    // TODO: Remove "visible".
    () => () => ({ activeTyping, styleOptions, visible }) =>
      visible &&
      (styleOptions.typingIndicatorStyle === 'dot' ? (
        <DotTypingIndicator />
      ) : (
        <TextTypingIndicator activeTyping={activeTyping} />
      ))
  ];
}
