import { useCallback } from 'react';

import useTrackEvent from './useTrackEvent';
import useWebChatInputContext from './internal/useWebChatInputContext';

export default function useSubmitSendBox() {
  const { submitSendBox } = useWebChatInputContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    (...args) => {
      // We cannot use spread operator as it broken in Angular.
      const method = args[0] || 'keyboard';

      trackEvent('submitSendBox', method);

      return submitSendBox(...args);
    },
    [submitSendBox, trackEvent]
  );
}
