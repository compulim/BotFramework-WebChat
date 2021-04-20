import { Constants, getMetadata } from 'botframework-webchat-core';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import createDebug from '../../utils/debug';
import SpeechContext from '../../contexts/internal/SpeechContext';
import useActivities from '../useActivities';
// import useGrammars from '../useGrammars';
import useInputMode from '../useInputMode';
import useLanguage from '../useLanguage';
import useSendBoxValue from '../useSendBoxValue';
import useSendMessage from '../useSendMessage';
import useSpeechRecognition from './useSpeechRecognition';
import warn from '../../utils/warn';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

let debug;

// We will prioritize speech recognition first, speech synthesis later.
// That means, if we start speech recognition, we will stop speech synthesis.
// One exception: if speech synthesis finished with the last activity marked as "expectingInput", we will start speech recognition.

// Potentially, we should move this <SpeechComposer> to the send box.
// If the send box is not rendered, then there will be no way to turn on the microphone.
const SpeechComposer = ({ children, directLineReferenceGrammarId, webSpeechPonyfillFactory }) => {
  debug || (debug = createDebug('SpeechComposer', { backgroundColor: 'red' }));

  const [_, setSendBoxValue] = useSendBoxValue();
  // const [grammars] = useGrammars();
  const [inputMode, setInputMode] = useInputMode();
  const [lang] = useLanguage();
  const [recognitionStartKey, setRecognitionStartKey] = useState(false);
  const [speechRecognitionInterims, setSpeechRecognitionInterims] = useState();
  const [speechRecognitionState, setSpeechRecognitionState] = useState(IDLE);
  const [synthesizeAfterActivityKey, setSynthesizeAfterActivityKey] = useState(false);
  const [visibleActivities] = useActivities('visible');
  const sendMessage = useSendMessage();

  // Perf: decoupling for callbacks
  const inputModeForCallbacksRef = useRef();
  const visibleActivitiesForCallbacksRef = useRef();

  inputModeForCallbacksRef.current = inputMode;
  visibleActivitiesForCallbacksRef.current = visibleActivities;

  const webSpeechPonyfill = useMemo(() => {
    const ponyfill =
      webSpeechPonyfillFactory && webSpeechPonyfillFactory({ referenceGrammarID: directLineReferenceGrammarId });

    debug(`Create webSpeechPonyfill`, { ponyfill });

    return ponyfill;
  }, [directLineReferenceGrammarId, webSpeechPonyfillFactory]);

  const markActivityAsSpoken = useCallback(
    spokenActivity => {
      setSynthesizeAfterActivityKey(prevSpeakAfterActivityKey => {
        const { current: visibleActivities } = visibleActivitiesForCallbacksRef;

        const prevIndex = visibleActivities.findIndex(
          activity => getMetadata(activity).key === prevSpeakAfterActivityKey
        );
        let index = visibleActivities.indexOf(spokenActivity);

        if (index > prevIndex) {
          // If:
          // - We are in speech input mode, and;
          // - There are no more activities to be spoken, and;
          // - The activity just spoke is "expecting input"
          // Then: turn on the microphone

          if (
            inputModeForCallbacksRef.current === 'speech' &&
            index === visibleActivities.length - 1 &&
            spokenActivity.inputHint === 'expectinginput'
          ) {
            setRecognitionStartKey(Date.now());
          }

          return getMetadata(spokenActivity).key;
        }

        index = prevIndex;

        if (!~index) {
          warn('Cannot mark an activity as spoken because it is not in the transcript.');
        } else if (index <= prevIndex) {
          warn(
            `Cannot mark an activity that were already spoken, it must be after activity with key of "${prevSpeakAfterActivityKey}".`
          );
        }

        return prevSpeakAfterActivityKey;
      });
    },
    [inputModeForCallbacksRef, setRecognitionStartKey, setSynthesizeAfterActivityKey, visibleActivitiesForCallbacksRef]
  );

  const startSynthesizeActivityFromOthers = useCallback(() => {
    setSynthesizeAfterActivityKey(prevSpeakAfterActivityKey => {
      const { current: visibleActivities } = visibleActivitiesForCallbacksRef;

      return prevSpeakAfterActivityKey || getMetadata(visibleActivities[visibleActivities.length - 1]).key;
    });
  }, [setSynthesizeAfterActivityKey, visibleActivitiesForCallbacksRef]);

  const stopSynthesizeActivityFromOthers = useCallback(() => setSynthesizeAfterActivityKey(false), [
    setSynthesizeAfterActivityKey
  ]);

  const startSpeechRecognition = useCallback(() => {
    debug('Starting speech recognition');

    setInputMode('speech');
    setRecognitionStartKey(Date.now());
    setSpeechRecognitionState(STARTING);
    setSynthesizeAfterActivityKey(false);
  }, [setInputMode, setRecognitionStartKey, setSynthesizeAfterActivityKey, setSpeechRecognitionState]);

  const stopSpeechRecognition = useCallback(() => {
    debug('Stopping speech recognition');

    setSpeechRecognitionState(IDLE);
  }, [setSpeechRecognitionState]);

  const handleSpeechRecognitionError = useCallback(
    error => {
      console.warn('botframework-webchat: Failed to complete speech recognition.', { error });

      setRecognitionStartKey(false);
      setSendBoxValue('');
      setSpeechRecognitionInterims(undefined);
      setSpeechRecognitionState(IDLE);
    },
    [setRecognitionStartKey, setSendBoxValue, setSpeechRecognitionInterims, setSpeechRecognitionState]
  );

  const handleSpeechRecognitionProgress = useCallback(
    interimResults => {
      const interims = interimResults.map(({ transcript }) => transcript);

      setSpeechRecognitionInterims(interims);

      setSpeechRecognitionState(prevDictateState =>
        prevDictateState === IDLE || prevDictateState === STARTING ? DICTATING : prevDictateState
      );

      // TODO: How to localizing the join? Some languages don't have word delimiters, such as CJK.
      setSendBoxValue(interims.join(' '));
    },
    [setSendBoxValue, setSpeechRecognitionInterims, setSpeechRecognitionState]
  );

  const handleSpeechRecognitionRecognized = useCallback(
    recognizedResults => {
      if (recognizedResults) {
        // #2957: Angular/Zone.js somehow fail if we destructure due to a bug on Angular side.
        // eslint-disable-next-line prefer-destructuring
        const { confidence, transcript } = recognizedResults[0];

        debug([`Recognized as "${transcript}"`], [{ confidence, transcript }]);

        setRecognitionStartKey(false);
        setSendBoxValue('');
        setSpeechRecognitionInterims(undefined);
        setSpeechRecognitionState(IDLE);
        startSynthesizeActivityFromOthers();

        sendMessage(transcript, 'speech', {
          channelData: { speech: { alternatives: [{ confidence, transcript }] } }
        });
      }
    },
    [
      sendMessage,
      setRecognitionStartKey,
      setSendBoxValue,
      setSpeechRecognitionInterims,
      setSpeechRecognitionState,
      startSynthesizeActivityFromOthers
    ]
  );

  // Only start speech recognition if the input mode is "speech".
  useSpeechRecognition(inputMode === 'speech' && recognitionStartKey, {
    errorCallback: handleSpeechRecognitionError,
    // TODO: Fill grammars
    // grammars,
    lang,
    ponyfill: webSpeechPonyfill,
    progressCallback: handleSpeechRecognitionProgress,
    recognizedCallback: handleSpeechRecognitionRecognized
  });

  const supportSpeechSynthesis = !!(webSpeechPonyfill && webSpeechPonyfill.speechSynthesis);

  const synthesizingActivities = useMemo(() => {
    // Only synthesize if:
    // - startSynthesizeActivityFromOthers was called, and;
    // - speech recognition has not started, and;
    // - input mode is "speech", and;
    // - speech synthesis engine is configured.

    if (!synthesizeAfterActivityKey || recognitionStartKey || inputMode !== 'speech' || !supportSpeechSynthesis) {
      return [];
    }

    const index = visibleActivities.findIndex(activity => getMetadata(activity).key === synthesizeAfterActivityKey);

    if (!~index) {
      return [];
    }

    return visibleActivities.slice(index + 1).filter(activity => getMetadata(activity).who !== 'self');
  }, [inputMode, recognitionStartKey, supportSpeechSynthesis, synthesizeAfterActivityKey, visibleActivities]);

  const shouldSynthesizeActivityFromOthers = !!synthesizeAfterActivityKey;

  // debug(
  //   ['Render'],
  //   [
  //     {
  //       recognitionStartKey,
  //       shouldSynthesizeActivityFromOthers,
  //       speechRecognitionInterims,
  //       synthesizeAfterActivityKey,
  //       synthesizingActivities
  //     }
  //   ]
  // );

  const speechContext = useMemo(
    () => ({
      directLineReferenceGrammarId,
      markActivityAsSpoken,
      shouldSynthesizeActivityFromOthers,
      speechRecognitionInterims,
      speechRecognitionState,
      startSpeechRecognition,
      startSynthesizeActivityFromOthers,
      stopSpeechRecognition,
      stopSynthesizeActivityFromOthers,
      synthesizingActivities,
      webSpeechPonyfill
    }),
    [
      directLineReferenceGrammarId,
      markActivityAsSpoken,
      shouldSynthesizeActivityFromOthers,
      speechRecognitionInterims,
      speechRecognitionState,
      startSpeechRecognition,
      startSynthesizeActivityFromOthers,
      stopSpeechRecognition,
      stopSynthesizeActivityFromOthers,
      synthesizingActivities,
      webSpeechPonyfill
    ]
  );

  return <SpeechContext.Provider value={speechContext}>{children}</SpeechContext.Provider>;
};

SpeechComposer.defaultProps = {
  children: undefined,
  directLineReferenceGrammarId: undefined,
  webSpeechPonyfillFactory: undefined
};

SpeechComposer.propTypes = {
  children: PropTypes.any,
  directLineReferenceGrammarId: PropTypes.string,
  webSpeechPonyfillFactory: PropTypes.func
};

export default SpeechComposer;
