export default async function getSettings({ totp }) {
  const res = await fetch('/api/settings', { headers: { 'x-authenticator-totp': totp } });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  return await res.json();
}
