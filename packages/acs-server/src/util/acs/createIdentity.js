const fetchACS = require('../fetchACS');

module.exports = async function createIdentity({ endpointURL, key }) {
  console.log('Creating identity');

  const res = await fetchACS(new URL('/identities?api-version=2020-07-20-preview2', endpointURL), {
    headers: {
      'content-type': 'application/json'
    },
    key,
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

  console.log(`Identity created ${json.id}`);

  return json;
};
