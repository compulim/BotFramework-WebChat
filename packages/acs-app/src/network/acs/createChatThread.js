export default async function createChatThread(topic, members, { token, totp }) {
  const res = await fetch('/api/acs/chat/threads', {
    body: JSON.stringify({
      members,
      topic
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

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/chat/createchatthread/createchatthread
  // {
  //   "multipleStatus": [
  //     {
  //       "id": "19:b355e41860604e7dacd072d586f47818@thread.v2",
  //       "statusCode": 201
  //     },
  //     {
  //       "id": "8:acs:8540c0de-899f-5cce-acb5-3ec493af3800_0e59221d-0c1d-46ae-9544-c963ce56c10a",
  //       "statusCode": 201
  //     },
  //     {
  //       "id": "8:acs:8540c0de-899f-5cce-acb5-3ec493af3800_0e59221d-0c1d-46ae-9544-c963ce56c10b",
  //       "statusCode": 201
  //     },
  //     {
  //       "id": "8:acs:8540c0de-899f-5cce-acb5-3ec493af3800_0e59221d-0c1d-46ae-9544-c963ce56c10c",
  //       "statusCode": 201
  //     },
  //     {
  //       "id": "8:acs:8540c0de-899f-5cce-acb5-3ec493af3800_0e59221d-0c1d-46ae-9544-c963ce56c10a",
  //       "statusCode": 403,
  //       "message": "Permissions check failed"
  //     }
  //   ]
  // }

  return await res.json();
}
