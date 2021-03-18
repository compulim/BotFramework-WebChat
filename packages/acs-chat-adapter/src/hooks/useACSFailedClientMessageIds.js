import { useFailedMessageIds } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';

export default function useACSFailedClientMessageIds() {
  return [useFailedMessageIds()];
}
