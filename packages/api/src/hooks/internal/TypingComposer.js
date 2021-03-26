import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import WebChatTypingContext from './WebChatTypingContext';

const TypingComposer = ({
  children,
  emitTypingIndicator: emitTypingIndicatorFromProps,
  sendTypingIndicator,
  typingUsers
}) => {
  // Adds a validation to make sure "typingUsers" does not contains "self", we can auto-fix.

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
  typingUsers: undefined
};

TypingComposer.propTypes = {
  children: PropTypes.any,
  emitTypingIndicator: PropTypes.func,
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
