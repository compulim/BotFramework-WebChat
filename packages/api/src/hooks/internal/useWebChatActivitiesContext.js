import { useContext } from 'react';

import WebChatActivitiesContext from './WebChatActivitiesContext';

export default function useWebChatActivitiesContext() {
  const context = useContext(WebChatActivitiesContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
