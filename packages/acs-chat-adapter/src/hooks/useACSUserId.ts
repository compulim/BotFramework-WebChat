// import { useUserId } from '@azure/acs-ui-sdk/dist/providers/ChatProvider';

// export default function useACSUserId(): [string] {
//   return [useUserId()];
// }

import useACSClients from './useACSClients';

export default function useACSUserId(): [string] {
  return [useACSClients().userId];
}
