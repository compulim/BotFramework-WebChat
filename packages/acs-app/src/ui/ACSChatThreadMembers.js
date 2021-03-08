import React, { useCallback, useEffect, useMemo, useState } from 'react';

import addChatThreadMembers from '../network/acs/addChatThreadMembers';
import listChatThreadMembers from '../network/acs/listChatThreadMembers';

const ACSChatThreadMembers = ({ threadId, token, totp }) => {
  const abortController = useMemo(() => new AbortController(), []);
  const { signal } = abortController;

  useEffect(() => () => abortController.abort(), [abortController]);

  const [addChatMemberUserId, setAddChatMemberUserId] = useState('');
  const [busy, setBusy] = useState();
  const [threadMembers, setThreadMembers] = useState();

  const refreshThreadMembers = useCallback(async () => {
    if (!threadId || !token || !totp) {
      return;
    }

    setThreadMembers(null);

    const { value } = await listChatThreadMembers(threadId, { token, totp });

    signal.aborted || setThreadMembers(value);
  }, [setThreadMembers, signal, threadId, token, totp]);

  const handleAddChatMemberClick = useCallback(async () => {
    setBusy(true);

    try {
      await addChatThreadMembers(threadId, [{ id: addChatMemberUserId }], { token, totp });

      if (!signal.aborted) {
        setAddChatMemberUserId('');
        refreshThreadMembers();
      }
    } finally {
      signal.aborted || setBusy(false);
    }
  }, [addChatMemberUserId, refreshThreadMembers, signal, threadId, token, totp]);

  const handleAddChatMemberUserIdChange = useCallback(
    ({ target: { value } }) => {
      setAddChatMemberUserId(value);
    },
    [setAddChatMemberUserId]
  );

  useEffect(() => {
    refreshThreadMembers();
  }, [refreshThreadMembers]);

  return (
    <div>
      {threadMembers ? (
        <ul>
          {threadMembers.map(({ id }) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      ) : (
        <div>Listing chat thread members&hellip;</div>
      )}
      <div>
        <input
          disabled={busy}
          onChange={handleAddChatMemberUserIdChange}
          placeholder="User ID"
          type="text"
          value={addChatMemberUserId}
        />
        <button disabled={!addChatMemberUserId || busy} onClick={handleAddChatMemberClick} type="button">
          Add chat member
        </button>
      </div>
    </div>
  );
};

export default ACSChatThreadMembers;
