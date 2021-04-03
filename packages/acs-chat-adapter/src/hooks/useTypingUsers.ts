import { useContext } from 'react';

import TypingUsers from '../types/TypingUsers';
import TypingUsersContext from '../contexts/TypingUsersContext';

export default function useTypingUsers(): [TypingUsers] {
  return useContext(TypingUsersContext);
}
