import { useMemo } from 'react';

import useCreateTypingIndicatorRenderer from './useCreateTypingIndicatorRenderer';

let showDeprecationNotes = true;

export default function useRenderTypingIndicator() {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useRenderTypingIndicator" is deprecated and will be removed on or after 2023-03-26. Please use "useCreateTypingIndicatorRenderer()" instead.'
    );

    showDeprecationNotes = false;
  }

  const createTypingIndicatorRenderer = useCreateTypingIndicatorRenderer();

  return useMemo(
    () => ({ activeTyping }) => {
      const renderTypingIndicator = createTypingIndicatorRenderer({ activeTyping });

      return !!renderTypingIndicator && renderTypingIndicator();
    },
    [createTypingIndicatorRenderer]
  );
}
