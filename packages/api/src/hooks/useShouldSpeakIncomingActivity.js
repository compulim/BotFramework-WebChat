import { useCallback } from 'react';

import useStartSynthesizeActivityFromOthers from './internal/useStartSynthesizeActivityFromOthers';
import useStopSynthesizeActivityFromOthers from './internal/useStopSynthesizeActivityFromOthers';
import useSpeechContext from './internal/useSpeechContext';

export default function useShouldSpeakIncomingActivity() {
  const { shouldSynthesizeActivityFromOthers } = useSpeechContext();
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
