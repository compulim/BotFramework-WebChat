const fetch = require('node-fetch');

module.exports = async function createChatThread(topic, members, { endpointURL, token }) {
  console.log('Creating chat thread');

  const res = await fetch(new URL('/chat/threads?api-version=2020-09-21-preview2', endpointURL), {
    body: JSON.stringify({
      members,
      topic
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

  const json = await res.json();

  console.log(`Chat thread created ${json.multipleStatus.find(({ type }) => type === 'Thread').id}`);

  return json;
};
