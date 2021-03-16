import { useEffect } from 'react';
import { useFetchThreadMembers } from '@azure/acs-ui-sdk';
import { useThreadMembers } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';

// This helper is needed because:
// - If fetchThreadMembers() is not called at least once, useThreadMembers() will always return empty array.

// Even fetchThreadMembers() is called, useThreadMembers() will not continue to update.
// There are no useSubscribeThreadMembers() hooks.

// TODO: I think the API design need some tweaks.

let EMPTY_ARRAY;

export default function useACSThreadMembersWithFetch() {
  EMPTY_ARRAY || (EMPTY_ARRAY = []);

  const fetchThreadMembers = useFetchThreadMembers();

  useEffect(() => {
    fetchThreadMembers();
  }, [fetchThreadMembers]);

  const result = useThreadMembers();

  return result && result.length ? result : EMPTY_ARRAY;
}
