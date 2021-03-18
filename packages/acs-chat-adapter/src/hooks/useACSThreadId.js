import { useThreadId } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';

export default function useACSThreadId() {
  return [useThreadId()];
}
