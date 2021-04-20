import { useCallback } from 'react';

import useInputContext from './internal/useInputContext';
import useTrackEvent from './useTrackEvent';

export default function useSubmitSendBox() {
  const { submitSendBox } = useInputContext();
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
