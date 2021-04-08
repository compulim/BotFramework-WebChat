import { TypingUsers } from 'botframework-webchat-core';
import { useContext } from 'react';

import TypingUsersContext from '../contexts/TypingUsersContext';

export default function useTypingUsers(): [TypingUsers] {
  return useContext(TypingUsersContext);
}
