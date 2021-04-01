import { createContext, useContext as useReactContext } from 'react';

import InternalTypingUsers from '../../types/internal/TypingUsers';

const context = createContext<{
  emitTyping: () => void;
  sendTypingIndicator: boolean;
  typingUsers: InternalTypingUsers;
}>(undefined);

context.displayName = 'WebChat.InternalTypingContext';

export function useContext() {
  const value = useReactContext(context);

  if (!value) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return value;
}

export default context;
