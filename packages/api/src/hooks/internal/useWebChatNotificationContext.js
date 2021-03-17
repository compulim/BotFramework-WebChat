import { useContext } from 'react';

import WebChatNotificationContext from './WebChatNotificationContext';

export default function useWebChatNotificationContext() {
  const context = useContext(WebChatNotificationContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
