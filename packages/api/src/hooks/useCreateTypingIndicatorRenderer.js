import { useMemo } from 'react';

import useAPIContext from './internal/useAPIContext';
import useStyleOptions from './useStyleOptions';

export default function useCreateTypingIndicatorRenderer() {
  const [styleOptions] = useStyleOptions();
  const { typingIndicatorRenderer } = useAPIContext();

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
