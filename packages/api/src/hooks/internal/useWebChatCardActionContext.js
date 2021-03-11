import { useContext } from 'react';

import WebChatCardActionContext from './WebChatCardActionContext';

export default function useWebChatCardActionContext() {
  const context = useContext(WebChatCardActionContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
