import { useCallback } from 'react';

import createCustomEvent from '../utils/createCustomEvent';
import useAPIContext from './internal/useAPIContext';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';

export default function useTrackException() {
  const { onTelemetry } = useAPIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();

  return useCallback(
    (error, fatal = true) => {
      if (!(error instanceof Error)) {
        return console.warn(
          'botframework-webchat: "error" passed to "useTrackException" must be specified and of type Error.'
        );
      }

      onTelemetry &&
        onTelemetry(
          createCustomEvent('exception', {
            dimensions: { ...readTelemetryDimensions() },
            error,
            fatal: !!fatal
          })
        );
    },
    [onTelemetry, readTelemetryDimensions]
  );
}
