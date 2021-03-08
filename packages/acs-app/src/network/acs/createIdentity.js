export default async function createIdentity({ totp }) {
  const res = await fetch('/api/acs/identities', {
    headers: {
      'content-type': 'application/json',
      'x-authenticator-totp': totp
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/communicationidentity/create
  // {
  //   "id": "8:acs:2dee53b4-368b-45b4-ab52-8493fb117652_00000005-14a2-493b-8a72-5a3a0d000081"
  // }

  return await res.json();
}
