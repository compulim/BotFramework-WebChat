import { useEffect } from 'react';

import removeInline from '../../Utils/removeInline';
import useWebChatUIContext from './useWebChatUIContext';

export default function useRegisterCallback(name, callback) {
  const { callbackRefs } = useWebChatUIContext();

  useEffect(() => {
    const callbacks = callbackRefs.current[name] || (callbackRefs.current[name] = []);

    callbacks.push(callback);

    return () => removeInline(callbacks, callback);
  }, [callback, callbackRefs, name]);
}
