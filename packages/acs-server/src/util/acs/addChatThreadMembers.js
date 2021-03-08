const fetch = require('node-fetch');

module.exports = async function addChatThreadMembers(threadId, members, { endpointURL, token }) {
  console.log(`Add ${members.length} members to chat thread ${threadId}`);

  const res = await fetch(new URL(`/chat/threads/${threadId}/members?api-version=2020-09-21-preview2`, endpointURL), {
    body: JSON.stringify({
      members
    }),
    headers: {
      authorization: token,
      'content-type': 'application/json'
    },
    method: 'POST'
  });

  if (!res.ok) {
    console.log(res.statusText);
    console.log(await res.text());

    throw new Error(`Server returned ${res.status}`);
  }

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/communicationidentity/create
  // {
  //   "id": "8:acs:2dee53b4-368b-45b4-ab52-8493fb117652_00000005-14a2-493b-8a72-5a3a0d000081"
  // }

  const json = await res.json();

  console.log(`Members added for chat thread ${threadId}`);

  return json;
};
