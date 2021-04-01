import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import WebChatTypingContext from './WebChatTypingContext';

const TypingComposer = ({ children, emitTyping: emitTypingFromProps, sendTypingIndicator, typingUsers }) => {
  const emitTyping = useMemo(
    () =>
      emitTypingFromProps &&
      (() => {
        sendTypingIndicator && emitTypingFromProps();
      }),
    [emitTypingFromProps, sendTypingIndicator]
  );

  const context = useMemo(
    () => ({
      emitTyping,
      sendTypingIndicator,
      typingUsers
    }),
    [emitTyping, sendTypingIndicator, typingUsers]
  );

  return <WebChatTypingContext.Provider value={context}>{children}</WebChatTypingContext.Provider>;
};

TypingComposer.defaultProps = {
  children: undefined,
  emitTyping: undefined,
  typingUsers: undefined
};

TypingComposer.propTypes = {
  children: PropTypes.any,
  emitTyping: PropTypes.func,
  sendTypingIndicator: PropTypes.bool.isRequired,
  typingUsers: PropTypes.objectOf(
    PropTypes.shape({
      at: PropTypes.number,
      name: PropTypes.string,
      role: PropTypes.string,
      who: PropTypes.string
    })
  )
};

export default TypingComposer;
