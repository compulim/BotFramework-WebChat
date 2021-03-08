import { useCallback, useState } from 'react';

const { sessionStorage } = window;

export default function useSessionState(initialValue, key) {
  const [value, setValue] = useState(() => (sessionStorage && sessionStorage.getItem(key)) || initialValue);

  const setValueWithSession = useCallback(
    nextValue => {
      setValue(nextValue);

      sessionStorage && sessionStorage.setItem(key, nextValue);
    },
    [key]
  );

  return [value, setValueWithSession];
}
