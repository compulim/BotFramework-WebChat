import { useCallback } from 'react';

import useAPIContext from './useAPIContext';

export default function useReadTelemetryDimensions() {
  const { telemetryDimensionsRef } = useAPIContext();

  return useCallback(() => ({ ...telemetryDimensionsRef.current }), [telemetryDimensionsRef]);
}
