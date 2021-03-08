import { useCallback, useMemo, useState } from 'react';

let warnedBrowserBlockStorage;

export default function useSessionState(initialValue, key) {
  const sessionStorage = useMemo(() => {
    // Accessing window.sessionStorage will failed if browser block cookies.
    try {
      return window.sessionStorage;
    } catch (err) {
      warnedBrowserBlockStorage || console.warn('useSessionState: Browser blocked access to sessionStorage, state will not be saved.');
      warnedBrowserBlockStorage = true;
    }
  }, []);

  const [value, setValue] = useState(() => (sessionStorage && sessionStorage.getItem(key)) || initialValue);

  const setValueWithSession = useCallback(
    nextValue => {
      setValue(nextValue);

      sessionStorage && sessionStorage.setItem(key, nextValue);
    },
    [key, sessionStorage]
  );

  return [value, setValueWithSession];
}
