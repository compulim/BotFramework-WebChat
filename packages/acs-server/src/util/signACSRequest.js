const { createHmac } = require('crypto');

module.exports = function signACSRequest(base64Key, verb, urlPathAndQuery, date, host, base64ContentHash) {
  const plainText = [verb, urlPathAndQuery, [date, host, base64ContentHash].join(';')].join('\n');
  const signature = createHmac('sha256', Buffer.from(base64Key, 'base64')).update(plainText, 'utf-8').digest('base64');

  return `HMAC-SHA256 SignedHeaders=date;host;x-ms-content-sha256&Signature=${signature}`;
};
