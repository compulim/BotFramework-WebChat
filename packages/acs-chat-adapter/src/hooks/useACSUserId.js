import { useUserId } from '@azure/acs-ui-sdk/dist/providers/ChatProvider';

export default function useACSIdentity() {
  // TODO: Read it from Redux store?
  return useUserId();
}
