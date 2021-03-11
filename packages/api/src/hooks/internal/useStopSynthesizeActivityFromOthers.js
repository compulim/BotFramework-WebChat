import useWebChatSpeechContext from './useWebChatSpeechContext';

export default function useStopSynthesizeActivityFromOthers() {
  return useWebChatSpeechContext().stopSynthesizeActivityFromOthers;
}
