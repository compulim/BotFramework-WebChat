export default function createFetchSpeechServicesCredentials(url) {
  let expireAfter = 0;
  let lastPromise;

  return () => {
    const now = Date.now();

    if (now > expireAfter) {
      expireAfter = now + 300000;
      lastPromise = fetch(url, { method: 'POST' }).then(
        res => res.json(),
        err => {
          expireAfter = 0;

          return Promise.reject(err);
        }
      );
    }

    return lastPromise;
  };
}
