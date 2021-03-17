import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import WebChatTypingContext from './WebChatTypingContext';

const TypingComposer = ({
  children,
  emitTypingIndicator: emitTypingIndicatorFromProps,
  sendTypingIndicator,
  typingUsers
}) => {
  const emitTypingIndicator = useMemo(
    () =>
      emitTypingIndicatorFromProps &&
      (() => {
        sendTypingIndicator && emitTypingIndicatorFromProps();
      }),
    [emitTypingIndicatorFromProps, sendTypingIndicator]
  );

  const context = useMemo(
    () => ({
      emitTypingIndicator,
      sendTypingIndicator,
      typingUsers
    }),
    [emitTypingIndicator, sendTypingIndicator, typingUsers]
  );

  return <WebChatTypingContext.Provider value={context}>{children}</WebChatTypingContext.Provider>;
};

TypingComposer.defaultProps = {
  children: undefined,
  emitTypingIndicator: undefined,
  sendTypingIndicator: true,
  typingUsers: {}
};

// TODO: Add isRequired to all props and set defaults in root <Composer> instead.
TypingComposer.propTypes = {
  children: PropTypes.any,
  emitTypingIndicator: PropTypes.func,
  sendTypingIndicator: PropTypes.bool,
  typingUsers: PropTypes.any // TODO: Check why objectOf is not working on empty object.
  // typingUsers: PropTypes.objectOf({
  //   at: PropTypes.number,
  //   name: PropTypes.string,
  //   role: PropTypes.string,
  //   who: PropTypes.string
  // })
};

export default TypingComposer;
