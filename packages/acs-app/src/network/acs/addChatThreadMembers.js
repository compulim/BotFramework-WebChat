export default async function addChatThreadMembers(threadId, members, { token, totp }) {
  const res = await fetch(`/api/acs/chat/threads/${threadId}/members`, {
    body: JSON.stringify({
      members
    }),
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-authenticator-totp': totp
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/chat/addchatthreadmembers/addchatthreadmembers
  // Returning HTTP 207 only

  return await res.json();
}
