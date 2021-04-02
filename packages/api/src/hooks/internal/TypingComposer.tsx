import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import InternalTypingUsers from '../../types/internal/TypingUsers';

import diffMap from '../../utils/diffMap';
import InternalTypingContext from '../../contexts/internal/TypingContext';
import usePrevious from './usePrevious';

// If no argument is passed to `emitTypingIndicator`, it is in "pulse" mode.
// In pulse mode, if another pulse was not received within a predefined period, it will stop the typing signal.
// This is the timeout (in milliseconds) for detecting missing pulse and stopping the typing signal.
const PULSE_EMIT_INDICATOR_TIMEOUT = 3000;

type ChatAdapterTypingUsers = {
  [userId: string]: {
    name: string;
  };
};

const TypingComposer = ({
  children,
  emitTyping: emitTypingFromProps,
  sendTypingIndicator,
  typingUsers
}: {
  children: any;
  emitTyping: (start: boolean) => void;
  sendTypingIndicator: boolean;
  typingUsers: ChatAdapterTypingUsers;
}) => {
  // TODO: Validate that "typingUsers" should not contains self.

  const now = Date.now();

  const prevTypingUsers = usePrevious(typingUsers) || {};
  const typingUsersMapRef = useRef<InternalTypingUsers>({});

  let { current: nextTypingUsersMap } = typingUsersMapRef;

  Object.entries(diffMap(prevTypingUsers, typingUsers)).forEach(([userId, [from, to]]) => {
    if (to) {
      nextTypingUsersMap = updateIn(nextTypingUsersMap, [userId, 'name'], () => to.name);

      if (!from) {
        nextTypingUsersMap = updateIn(nextTypingUsersMap, [userId, 'at'], () => now);

        // TODO: [P3] Deprecate and remove "expireAt" and "role" on or after 2021-04-01.
        nextTypingUsersMap = updateIn(nextTypingUsersMap, [userId, 'expireAt'], () => Infinity);
        nextTypingUsersMap = updateIn(nextTypingUsersMap, [userId, 'role'], () => 'bot');
      }
    } else {
      nextTypingUsersMap = updateIn(nextTypingUsersMap, [userId]);
    }
  });

  typingUsersMapRef.current = nextTypingUsersMap;

  const sendStopTypingTimeoutRef = useRef<NodeJS.Timeout>();

  // If chat adapter changed emitTyping(), we should send stop typing to the previous emitTyping() immediately.
  useEffect(() => {
    let prevEmitTyping = emitTypingFromProps;

    return () => {
      const { current: sendStopTypingTimeout } = sendStopTypingTimeoutRef;

      if (sendStopTypingTimeout) {
        prevEmitTyping(false);
        clearTimeout(sendStopTypingTimeout);
      }

      sendStopTypingTimeoutRef.current = undefined;
    };
  }, [emitTypingFromProps, sendStopTypingTimeoutRef]);

  const emitTyping = useMemo(
    () =>
      emitTypingFromProps &&
      ((start?: boolean) => {
        if (!sendTypingIndicator) {
          return;
        }

        clearTimeout(sendStopTypingTimeoutRef.current);
        sendStopTypingTimeoutRef.current = undefined;

        if (typeof start === 'boolean') {
          emitTypingFromProps(start);
        } else {
          sendStopTypingTimeoutRef.current = setTimeout(() => emitTypingFromProps(false), PULSE_EMIT_INDICATOR_TIMEOUT);

          emitTypingFromProps(true);
        }
      }),
    [emitTypingFromProps, sendStopTypingTimeoutRef, sendTypingIndicator]
  );

  const context = useMemo(
    () => ({
      emitTyping,
      sendTypingIndicator,
      typingUsers: nextTypingUsersMap
    }),
    [emitTyping, nextTypingUsersMap, sendTypingIndicator]
  );

  return <InternalTypingContext.Provider value={context}>{children}</InternalTypingContext.Provider>;
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
      name: PropTypes.string
    })
  )
};

export default TypingComposer;
