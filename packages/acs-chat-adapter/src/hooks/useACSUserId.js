import { useUserId } from '@azure/acs-ui-sdk/dist/providers/ChatProvider';

export default function useACSUserId() {
  return [useUserId()];
}
