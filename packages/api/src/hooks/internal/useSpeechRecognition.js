import { useEffect, useMemo, useRef } from 'react';

import useChanged from './useChanged';
import useForceRender from './useForceRender';

export default function useSpeechRecognition(
  key,
  {
    errorCallback,
    grammars,
    lang,
    ponyfill: { SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition } = {},
    progressCallback,
    recognizedCallback
  } = {}
) {
  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => () => abortController.abort(), [abortController]);

  const { signal } = abortController;

  // Start

  const abortingRef = useRef();
  const currentKeyRef = useRef();
  const finalResultRef = useRef();
  const forceRender = useForceRender();
  const keyChanged = useChanged(key);
  const recognitionRef = useRef();

  if (key && SpeechRecognition && key !== currentKeyRef.current && !recognitionRef.current) {
    abortingRef.current = false;
    currentKeyRef.current = key;
    finalResultRef.current = undefined;

    const nextRecognition = (recognitionRef.current = new SpeechRecognition());
    let recognized;

    if (grammars) {
      nextRecognition.grammars = grammars;
    }

    nextRecognition.interimResults = true;
    nextRecognition.lang = lang;

    const handleEvent = event => {
      const { target, type } = event;

      if (signal.aborted || target !== recognitionRef.current) {
        return;
      }

      if (type === 'error') {
        errorCallback && errorCallback(event.error);
      } else if (type === 'audiostart') {
        if (!abortingRef.current) {
          progressCallback && progressCallback([]);
        }
      } else if (type === 'result') {
        if (!abortingRef.current) {
          const { results } = event;
          const normalizedResults = [].map.call(results, alts => {
            // #2957: Angular/Zone.js somehow fail if we destructure due to a bug on Angular side.
            // eslint-disable-next-line prefer-destructuring
            const firstAlt = alts[0];

            return {
              confidence: firstAlt.confidence,
              isFinal: alts.isFinal,
              transcript: firstAlt.transcript
            };
          });

          if (normalizedResults.length && normalizedResults[0].isFinal) {
            // #2957: Angular/Zone.js somehow fail if we destructure due to a bug on Angular side.
            // eslint-disable-next-line prefer-destructuring
            finalResultRef.current = normalizedResults[0];

            forceRender();

            recognizedCallback && recognizedCallback(normalizedResults);
            recognized = true;
          } else {
            progressCallback && progressCallback(normalizedResults);
          }
        }
      } else if (type === 'end') {
        if (!recognized) {
          recognizedCallback && recognizedCallback();
        }

        recognitionRef.current = null;
        forceRender();
      }
    };

    ['audiostart', 'end', 'error', 'result'].forEach(name => nextRecognition.addEventListener(name, handleEvent));

    nextRecognition.start();
  } else if (keyChanged) {
    if (!key) {
      finalResultRef.current = undefined;
    }

    if (recognitionRef.current) {
      abortingRef.current = true; // Some SpeechRecognition objects are not abortable, just ignore its "result" event.
      recognitionRef.current.abort && recognitionRef.current.abort(); // This will eventually ends up with "end" event.
    }
  }

  useEffect(
    () => () => {
      recognitionRef.current && recognitionRef.current.abort && recognitionRef.current.abort();
    },
    [recognitionRef]
  );

  return finalResultRef.current;
}
