import { hooks } from 'botframework-webchat-api';
import { useEffect } from 'react';

import { checkSupport as supportWorker } from '../../Utils/downscaleImageToDataURL/downscaleImageToDataURLUsingWorker';

const { useTrackDimension, useWebSpeechPonyfill } = hooks;

const Tracker = () => {
  const [webSpeechPonyfill] = useWebSpeechPonyfill();
  const trackDimension = useTrackDimension();

  const speechRecognitionCapability = !!webSpeechPonyfill.SpeechRecognition;
  const speechSynthesisCapability = !!webSpeechPonyfill.speechSynthesis;

  useEffect(() => {
    trackDimension('capability:downscaleImage:workerType', supportWorker() ? 'web worker' : 'main');
    trackDimension('capability:renderer', 'html');

    // TODO: [P2] #2937 Differentiate between Cognitive Services and browser speech
    trackDimension('prop:speechRecognition', !!speechRecognitionCapability + '');
    trackDimension('prop:speechSynthesis', !!speechSynthesisCapability + '');
  }, [trackDimension, speechRecognitionCapability, speechSynthesisCapability]);

  return false;
};

export default Tracker;
