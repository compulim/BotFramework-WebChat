import useWebChatSpeechContext from './useWebChatSpeechContext';

export default function useStartSynthesizeActivityFromOthers() {
  return useWebChatSpeechContext().startSynthesizeActivityFromOthers;
}
