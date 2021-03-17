import { useContext } from 'react';

import WebChatTypingContext from './WebChatTypingContext';

export default function useWebChatTypingContext() {
  const context = useContext(WebChatTypingContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
