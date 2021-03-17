import useWebChatTypingContext from './internal/useWebChatTypingContext';

let showDeprecationNotes = true;

export default function useLastTypingAt() {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useLastTypingAt" is deprecated. Please use "useActiveTyping" instead. This hook will be removed on or after 2022-02-16.'
    );

    showDeprecationNotes = false;
  }

  return [useWebChatTypingContext().lastTypingAt];
}
