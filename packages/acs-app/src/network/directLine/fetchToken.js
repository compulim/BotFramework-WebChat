export default async function fetchToken() {
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });

  if (!res.ok) {
    throw new Error('Failed to fetch token from MockBot');
  }

  return (await res.json()).token;
}
