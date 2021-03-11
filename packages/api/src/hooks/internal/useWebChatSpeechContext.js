import { useContext } from 'react';

import WebChatSpeechContext from './WebChatSpeechContext';

export default function useWebChatSpeechContext() {
  const context = useContext(WebChatSpeechContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
