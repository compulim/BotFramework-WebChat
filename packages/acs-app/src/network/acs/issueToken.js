export default async function issueToken(identity, scopes, { totp }) {
  const res = await fetch(`/api/acs/identities/${identity}/token`, {
    body: JSON.stringify({
      scopes
    }),
    headers: {
      'content-type': 'application/json',
      'x-authenticator-totp': totp
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  // Sample response from https://docs.microsoft.com/en-us/rest/api/communication/communicationidentity/issuetoken
  // {
  //   "id": "8:acs:2dee53b4-368b-45b4-ab52-8493fb117652_00000005-14a2-493b-8a72-5a3a0d000081",
  //   "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwMl9pbnQiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjJkZWU1M2I0LTM2OGItNDViNC1hYjUyLTg0OTNmYjExNzY1Ml8wMDAwMDAwNS0xNGIwLWIwM2QtY2NjYy1iYWExZTEzYzAwMDEiLCJzY3AiOjE3OTIsImNzaSI6IjE1OTk2ODc1NzkiLCJpYXQiOjE1OTk2ODc1NzksImV4cCI6MTU5OTc3Mzk3OSwiYWNzU2NvcGUiOiJjaGF0IiwicmVzb3VyY2VJZCI6IjJkZWU1M2I0LTM2OGItNDViNC1hYjUyLTg0OTNmYjExNzY1MiJ9.S8Pryk7MVe0L8_KcTOjsGaU_6FXmcupVS8X73kJ2FW1CAotyJZb0YUoft_iXkbnTpJ3XK01SyhaXHcT48tXTsi1NcvyUqDk9u4rVKZkheA2F4ddLKYckO-RBw4mCHxlwsuiALNesR0MruhgiOSE1F0h_djDn6oKewSkyfd1FTWVqReeY1oIY4U0yi7_B8u3zNPiEFlv-Aqe4y1ISqi0009lt2u3EApjQ6pOIP8Jk9HAqbINwi2_lN5VAxUgK1XqvMBsiBmiB7fEfh-dNxB9tgH-tTGZQfRSprkjg6_KBVdYY7DTSr80J7Qez4JjoHwQ22DYKF8mleuFOysbTlLD0AA",
  //   "expiresOn": "2020-09-10T21:39:39.3244584+00:00"
  // }

  return await res.json();
}
