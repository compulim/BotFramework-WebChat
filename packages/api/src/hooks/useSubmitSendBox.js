import { useCallback } from 'react';

import useTrackEvent from './useTrackEvent';
import useWebChatSendBoxContext from './internal/useWebChatSendBoxContext';

export default function useSubmitSendBox() {
  const { submitSendBox } = useWebChatSendBoxContext();
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
