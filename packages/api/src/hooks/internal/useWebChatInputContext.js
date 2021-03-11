import { useContext } from 'react';

import WebChatInputContext from './WebChatInputContext';

export default function useWebChatInputContext() {
  const context = useContext(WebChatInputContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
