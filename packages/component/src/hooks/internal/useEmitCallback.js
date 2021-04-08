import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useEmitCallback(name, ...args) {
  const { callbackRefs } = useWebChatUIContext();

  return useCallback(() => (callbackRefs.current[name] || []).forEach(callback => callback(...args)), [
    args,
    callbackRefs,
    name
  ]);
}
