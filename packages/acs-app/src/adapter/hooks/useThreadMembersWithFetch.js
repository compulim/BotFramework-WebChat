import { useEffect } from 'react';
import { useFetchThreadMembers } from '@azure/acs-ui-sdk';
import { useThreadMembers } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';

// This helper is needed because:
// - If fetchThreadMembers() is not called at least once, useThreadMembers() will always return empty array.

// Even fetchThreadMembers() is called, useThreadMembers() will not continue to update.
// There are no useSubscribeThreadMembers() hooks.

// I think the API design need some tweaks.

export default function useThreadMembersWithFetch() {
  const fetchThreadMembers = useFetchThreadMembers();

  useEffect(() => {
    fetchThreadMembers();
  }, [fetchThreadMembers]);

  return useThreadMembers();
}
