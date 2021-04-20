import { useCallback } from 'react';
import useAPIContext from './internal/useAPIContext';

export default function useVoiceSelector(activity) {
  const context = useAPIContext();

  return useCallback(voices => context.selectVoice(voices, activity), [activity, context]);
}
