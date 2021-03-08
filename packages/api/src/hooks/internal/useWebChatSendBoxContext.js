import { useContext } from 'react';

import WebChatSendBoxContext from './WebChatSendBoxContext';

export default function useWebChatSendBoxContext() {
  const context = useContext(WebChatSendBoxContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
