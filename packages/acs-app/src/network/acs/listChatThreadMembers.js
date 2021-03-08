export default async function listChatThreadMembers(threadId, { token, totp }) {
  const res = await fetch(`/api/acs/chat/threads/${threadId}/members`, {
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-authenticator-totp': totp
    }
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/chat/addchatthreadmembers/addchatthreadmembers
  // Returning HTTP 207 only

  return await res.json();
}
