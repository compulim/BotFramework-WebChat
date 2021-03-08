const fetch = require('node-fetch');

module.exports = async function listChatThreadMembers(threadId, { endpointURL, token }) {
  console.log(`Getting member list of chat thread ${threadId}`);

  const res = await fetch(new URL(`/chat/threads/${threadId}/members?api-version=2020-09-21-preview2`, endpointURL), {
    headers: {
      authorization: token,
      'content-type': 'application/json'
    }
  });

  if (!res.ok) {
    console.log(res.statusText);
    console.log(await res.text());

    throw new Error(`Server returned ${res.status}`);
  }

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/chat/listchatthreadmembers/listchatthreadmembers
  // {
  //   "value": [
  //     {
  //       "id": "8:acs:8540c0de-899f-5cce-acb5-3ec493af3800_0e59221d-0c1d-46ae-9544-c963ce56c10a",
  //       "displayName": "Jane",
  //       "shareHistoryTime": "2020-06-06T05:55:41Z"
  //     },
  //     {
  //       "id": "8:acs:8540c0de-899f-5cce-acb5-3ec493af3800_0e59221d-0c1d-46ae-9544-c963ce56c10b",
  //       "displayName": "Alex",
  //       "shareHistoryTime": "2020-06-06T05:55:41Z"
  //     }
  //   ],
  //   "nextLink": null
  // }

  const json = await res.json();

  console.log(`Members added for chat thread ${threadId}`);

  return json;
};
