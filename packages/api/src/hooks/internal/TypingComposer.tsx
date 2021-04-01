import PropTypes from 'prop-types';
import React, { useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import InternalTypingUsers from '../../types/internal/TypingUsers';

import diffMap from '../../utils/diffMap';
import InternalTypingContext from '../../contexts/internal/TypingContext';
import usePrevious from './usePrevious';

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
  emitTyping: () => void;
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
