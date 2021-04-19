// import { useThreadId } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';

// export default function useACSThreadId(): [string] {
//   return [useThreadId()];
// }

import useACSClients from './useACSClients';

export default function useACSThreadId(): [string] {
  return [useACSClients().threadId];
}
