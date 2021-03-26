import { useMemo } from 'react';

import useStyleOptions from './useStyleOptions';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useCreateTypingIndicatorRenderer() {
  const [styleOptions] = useStyleOptions();
  const { typingIndicatorRenderer } = useWebChatAPIContext();

  return useMemo(
    () => ({ activeTyping, typing }) => {
      const result = typingIndicatorRenderer({ activeTyping, styleOptions, typing });

      if (result !== false && typeof result !== 'function') {
        console.warn(
          'botframework-webchat: typingIndicatorMiddleware should return a function to render the typing indicator, or return false if typing indicator should be hidden. Please refer to HOOKS.md for details.'
        );

        return () => result;
      }

      return result;
    },
    [styleOptions, typingIndicatorRenderer]
  );
}
