import { useCallback, useState } from 'react';

function useForceRender(): () => void {
  const [, setForceRender] = useState<unknown>();

  return useCallback(() => setForceRender({}), [setForceRender]);
}

export default useForceRender;
