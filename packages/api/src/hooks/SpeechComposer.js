import { Constants } from 'botframework-webchat-core';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import createDebug from '../utils/debug';
import fromWho from '../utils/fromWho';
import getActivityKey from '../utils/getActivityKey';
import useActivities from './useActivities';
// import useGrammars from './useGrammars';
import useInputMode from './useInputMode';
import useLanguage from './useLanguage';
import useSendBoxValue from './useSendBoxValue';
import useSendMessage from './useSendMessage';
import useSpeechRecognition from './internal/useSpeechRecognition';
import WebChatSpeechContext from './internal/WebChatSpeechContext';

const {
  DictateState: { DICTATING, IDLE, STARTING }
} = Constants;

let debug;

// We will prioritize speech recognition first, speech synthesis later.
// That means, if we start speech recognition, we will stop speech synthesis.
// One exception: if speech synthesis finished with the last activity marked as "expectingInput", we will start speech recognition.

// Potentially, we should move this <SpeechComposer> to the send box.
// If the send box is not rendered, then there will be no way to turn on the microphone.
const SpeechComposer = ({
  children,
  // We are (slowly) renaming typo: ID -> Id.
  directLine: { referenceGrammarID: referenceGrammarId } = {},
  webSpeechPonyfillFactory
}) => {
  debug || (debug = createDebug('SpeechComposer', { backgroundColor: 'red' }));

  const [_, setSendBoxValue] = useSendBoxValue();
  const [activities] = useActivities();
  const [inputMode, setInputMode] = useInputMode();
  const [speechRecognitionInterims, setSpeechRecognitionInterims] = useState();
  const [speechRecognitionState, setSpeechRecognitionState] = useState(IDLE);
  // const [grammars] = useGrammars();
  const [lang] = useLanguage();
  const [recognitionStartKey, setRecognitionStartKey] = useState(false);
  const [synthesizeAfterActivityKey, setSynthesizeAfterActivityKey] = useState(false);
  const sendMessage = useSendMessage();

  // This is for improving perf by decoupling some deps from callback.
  const activitiesRef = useRef();
  const inputModeRef = useRef();

  activitiesRef.current = activities;
  inputModeRef.current = inputMode;

  const webSpeechPonyfill = useMemo(() => {
    const ponyfill = webSpeechPonyfillFactory && webSpeechPonyfillFactory({ referenceGrammarID: referenceGrammarId });

    debug(`Create webSpeechPonyfill`, { ponyfill });

    return ponyfill;
  }, [referenceGrammarId, webSpeechPonyfillFactory]);

  const markActivityAsSpoken = useCallback(
    spokenActivity => {
      const { current: activities } = activitiesRef;

      setSynthesizeAfterActivityKey(prevSpeakAfterActivityKey => {
        const prevIndex = activities.findIndex(activity => getActivityKey(activity) === prevSpeakAfterActivityKey);
        let index = activities.indexOf(spokenActivity);
        let speakAfterActivityKey = prevSpeakAfterActivityKey;

        if (index > prevIndex) {
          speakAfterActivityKey = getActivityKey(spokenActivity);

          // If:
          // - We are in speech input mode, and;
          // - There are no more activities to be spoken, and;
          // - The activity just spoke is "expecting input"
          // Then: turn on the microphone

          if (
            inputModeRef.current === 'speech' &&
            index === activities.length - 1 &&
            spokenActivity.inputHint === 'expectinginput'
          ) {
            setRecognitionStartKey(Date.now());
          }
        } else {
          index = prevIndex;

          if (!~index) {
            console.warn(
              'botframework-webchat: Cannot mark an activity as spoken because it is not in the transcript.'
            );
          } else if (index <= prevIndex) {
            console.warn(
              `botframework-webchat: Cannot mark an activity that were already spoken, it must be after activity with key of "${prevSpeakAfterActivityKey}".`
            );
          }
        }

        return speakAfterActivityKey;
      });
    },
    [activitiesRef, inputModeRef, setRecognitionStartKey, setSynthesizeAfterActivityKey]
  );

  const startSynthesizeActivityFromOthers = useCallback(() => {
    const { current: activities } = activitiesRef;

    setSynthesizeAfterActivityKey(
      prevSpeakAfterActivityKey => prevSpeakAfterActivityKey || getActivityKey(activities[activities.length - 1])
    );
  }, [activitiesRef, setSynthesizeAfterActivityKey]);

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

  const supportSpeechSynthesis = !!webSpeechPonyfill.speechSynthesis;

  const synthesizingActivities = useMemo(() => {
    // Only synthesize if:
    // - startSynthesizeActivityFromOthers was called, and;
    // - speech recognition has not started, and;
    // - input mode is "speech", and;
    // - speech synthesis engine is configured.

    if (!synthesizeAfterActivityKey || recognitionStartKey || inputMode !== 'speech' || !supportSpeechSynthesis) {
      return [];
    }

    const index = activities.findIndex(activity => getActivityKey(activity) === synthesizeAfterActivityKey);

    if (!~index) {
      return [];
    }

    return activities.slice(index + 1).filter(activity => fromWho(activity) !== 'self');
  }, [activities, inputMode, recognitionStartKey, supportSpeechSynthesis, synthesizeAfterActivityKey]);

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
      markActivityAsSpoken,
      referenceGrammarId,
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
      markActivityAsSpoken,
      referenceGrammarId,
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

  return <WebChatSpeechContext.Provider value={speechContext}>{children}</WebChatSpeechContext.Provider>;
};

SpeechComposer.defaultProps = {
  children: undefined,
  directLine: undefined,
  webSpeechPonyfillFactory: undefined
};

SpeechComposer.propTypes = {
  children: PropTypes.any,
  directLine: PropTypes.shape({
    referenceGrammarID: PropTypes.string
  }),
  webSpeechPonyfillFactory: PropTypes.func
};

export default SpeechComposer;
