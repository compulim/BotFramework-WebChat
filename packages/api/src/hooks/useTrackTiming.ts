import { useCallback } from 'react';

import createCustomEvent from '../utils/createCustomEvent';
import randomId from '../utils/randomId';
import tryCatchFinally from '../utils/tryCatchFinally';
import useReadTelemetryDimensions from './internal/useReadTelemetryDimensions';
import useTrackException from './useTrackException';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * This function will emit timing measurements for the execution of a synchronous or asynchronous function. Before the execution,
 * the `onTelemetry` handler will be triggered with a `timingstart` event. After completion, regardless of resolve or reject, the
 * `onTelemetry` handler will be triggered again with a `timingend` event.
 *
 * If the function throws an exception while executing, the exception will be reported to `useTrackException` hook as a non-fatal error.
 */
export default function useTrackTiming<T>(): {
  (name: string, fn: () => T): T;
  (name: string, fn: () => Promise<T>): Promise<T>;
  (name: string, promise: Promise<T>): Promise<T>;
} {
  const { onTelemetry } = useWebChatAPIContext();
  const readTelemetryDimensions = useReadTelemetryDimensions();
  const trackException = useTrackException();

  return useCallback<any>(
    (name: string, functionOrPromise: any) => {
      if (!name || typeof name !== 'string') {
        return console.warn(
          'botframework-webchat: "name" passed to "useTrackTiming" hook must be specified and of type string.'
        );
      } else if (typeof functionOrPromise !== 'function' && typeof functionOrPromise.then !== 'function') {
        return console.warn(
          'botframework-webchat: "functionOrPromise" passed to "useTrackTiming" hook must be specified, of type function or Promise.'
        );
      }

      const timingId = randomId();

      onTelemetry &&
        onTelemetry(
          createCustomEvent('timingstart', {
            dimensions: readTelemetryDimensions(),
            name,
            timingId
          })
        );

      const startTime = Date.now();

      return tryCatchFinally(
        functionOrPromise,
        err => {
          trackException(err, false);

          throw err;
        },
        () => {
          const duration = Date.now() - startTime;

          onTelemetry &&
            onTelemetry(
              createCustomEvent('timingend', {
                dimensions: readTelemetryDimensions(),
                duration,
                name,
                timingId
              })
            );
        }
      );
    },
    [onTelemetry, readTelemetryDimensions, trackException]
  );
}
