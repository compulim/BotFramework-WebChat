const { createHash } = require('crypto');
const fetch = require('node-fetch');

const signACSRequest = require('./signACSRequest');

module.exports = function fetchACS(url, { body = '', headers, key, method = 'GET', ...options } = {}) {
  if (!key) {
    throw new Error('"key" must be specified.');
  }

  const base64ContentHash = createHash('sha256').update(body).digest('base64');
  const date = new Date().toUTCString();
  const { pathname, search } = new URL(url);

  const authorization = signACSRequest(key, method, pathname + search, date, new URL(url).host, base64ContentHash);

  return fetch(url, {
    body,
    headers: {
      ...headers,
      authorization,
      date,
      'x-ms-content-sha256': base64ContentHash
    },
    method,
    ...options
  });
};
