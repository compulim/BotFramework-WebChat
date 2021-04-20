require('dotenv/config');

const qrcode = require('qrcode');
const { authenticator } = require('@otplib/preset-default');

const user = 'hawo-acs-dev';
const service = 'ACS Chat Adapter';

const otpauth = authenticator.keyuri(user, service, process.env.AUTHENTICATOR_SECRET);

qrcode.toDataURL(otpauth, (err, imageUrl) => {
  if (err) {
    console.log('Error with QR');
    return;
  }
  console.log(imageUrl);
});
