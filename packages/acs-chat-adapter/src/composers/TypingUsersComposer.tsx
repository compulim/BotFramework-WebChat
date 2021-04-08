import { TypingUsers } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { FC, useMemo, useRef } from 'react';
import updateIn from 'simple-update-in';

import { default as TypingUsersContext } from '../contexts/TypingUsersContext';
import diffArray from '../utils/diffArray';
import useACSTypingUsers from '../hooks/useACSTypingUsers';
import useACSUserId from '../hooks/useACSUserId';
import useDebugDeps from '../hooks/useDebugDeps';
import usePrevious from '../hooks/usePrevious';
import UserProfiles from '../types/UserProfiles';

const TypingUsersComposer: FC<{ userProfiles: UserProfiles }> = ({ children, userProfiles }) => {
  const [acsTypingUsers] = useACSTypingUsers();
  const [userId] = useACSUserId();

  const acsTypingUserIdsExcludeSelf = useMemo(() => acsTypingUsers.filter(targetUserId => targetUserId !== userId), [
    acsTypingUsers,
    userId
  ]);

  const prevACSTypingUserIdsExcludeSelf = usePrevious(acsTypingUserIdsExcludeSelf) || [];

  const { removed } = diffArray(prevACSTypingUserIdsExcludeSelf, acsTypingUserIdsExcludeSelf);

  const typingUsersRef = useRef<TypingUsers>({});
  let { current: nextTypingUsers } = typingUsersRef;

  nextTypingUsers = updateIn(nextTypingUsers, [(_, userId: string) => removed.includes(userId)]);

  nextTypingUsers = acsTypingUserIdsExcludeSelf.reduce(
    (nextTypingUsers, userId) =>
      updateIn(nextTypingUsers, [userId, 'name'], () => (userProfiles[userId] || {}).name || ''),
    nextTypingUsers
  );

  useDebugDeps(
    {
      acsTypingUsers,
      acsTypingUserIdsExcludeSelf,
      changed: typingUsersRef.current !== nextTypingUsers,
      nextTypingUsers,
      userId,
      typingUsers: typingUsersRef.current
    },
    '<ACSTypingUsersComposer>'
  );

  typingUsersRef.current = nextTypingUsers;

  return <TypingUsersContext.Provider value={[nextTypingUsers]}>{children}</TypingUsersContext.Provider>;
};

TypingUsersComposer.propTypes = {
  userProfiles: PropTypes.objectOf(
    PropTypes.shape({
      image: PropTypes.string,
      initials: PropTypes.string,
      name: PropTypes.string
    })
  )
};

export default TypingUsersComposer;
