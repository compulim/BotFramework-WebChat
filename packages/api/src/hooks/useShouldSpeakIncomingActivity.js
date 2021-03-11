import { useCallback } from 'react';

import useStartSynthesizeActivityFromOthers from './internal/useStartSynthesizeActivityFromOthers';
import useStopSynthesizeActivityFromOthers from './internal/useStopSynthesizeActivityFromOthers';
import useWebChatSpeechContext from './internal/useWebChatSpeechContext';

export default function useShouldSpeakIncomingActivity() {
  const { shouldSynthesizeActivityFromOthers } = useWebChatSpeechContext();
  const startSynthesizeActivityFromOthers = useStartSynthesizeActivityFromOthers();
  const stopSynthesizeActivityFromOthers = useStopSynthesizeActivityFromOthers();

  return [
    shouldSynthesizeActivityFromOthers,
    useCallback(value => (value ? startSynthesizeActivityFromOthers() : stopSynthesizeActivityFromOthers()), [
      startSynthesizeActivityFromOthers,
      stopSynthesizeActivityFromOthers
    ])
  ];
}
