import PropTypes from 'prop-types';
import React, { FC, useMemo } from 'react';

import { TypingUsers } from '../types/TypingUsers';
import { UserProfiles } from '../types/UserProfiles';

import { default as TypingUsersContext } from '../contexts/TypingUsersContext';
import createACSTypingUserToWebChatTypingEntryConverter from '../converters/createACSTypingUserToWebChatTypingEntryConverter';
import useACSTypingUsers from '../hooks/useACSTypingUsers';
import useACSUserId from '../hooks/useACSUserId';
import useDebugDeps from '../hooks/useDebugDeps';
import useMapper from '../hooks/useMapper';

const TypingUsersComposer: FC<{ userProfiles: UserProfiles }> = ({ children, userProfiles }) => {
  const [userId] = useACSUserId();

  const [acsTypingUsers] = useACSTypingUsers();

  const acsTypingUsersExcludeSelf = useMemo(
    () => acsTypingUsers.filter(member => member.user.communicationUserId !== userId),
    [acsTypingUsers]
  );

  const acsTypingUserToWebChatTypingEntry = useMemo(() => createACSTypingUserToWebChatTypingEntryConverter(userProfiles), [userProfiles]);

  const typingEntries = useMapper(acsTypingUsersExcludeSelf, acsTypingUserToWebChatTypingEntry);

  const typingUsers = useMemo<[TypingUsers]>(() => [Object.fromEntries(typingEntries)], [typingEntries]);

  useDebugDeps(
    {
      acsTypingUsers: acsTypingUsers,
      acsTypingUsersExcludeSelf,
      typingEntries,
      typingUsers,
      userId
    },
    '<ACSTypingUsersComposer>'
  );

  return <TypingUsersContext.Provider value={typingUsers}>{children}</TypingUsersContext.Provider>;
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
