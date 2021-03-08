require('dotenv').config();

const { authenticator } = require('otplib');
const { BurstyRateLimiter, RateLimiterMemory } = require('rate-limiter-flexible');
const { join } = require('path');
const { json } = require('body-parser');
const cors = require('cors');
const express = require('express');

const addChatThreadMembers = require('./util/acs/addChatThreadMembers');
const createChatThread = require('./util/acs/createChatThread');
const createIdentity = require('./util/acs/createIdentity');
const issueToken = require('./util/acs/issueToken');
const listChatThreadMembers = require('./util/acs/listChatThreadMembers');

const { ACS_ENDPOINT_URL, ACS_KEY, AUTHENTICATOR_SECRET, PORT = 3001 } = process.env;
const PUBLIC_PATH = join(__dirname, '../build');

const app = express();
const rateLimiter = new BurstyRateLimiter(
  new RateLimiterMemory({
    points: 2,
    duration: 1
  }),
  new RateLimiterMemory({
    keyPrefix: 'burst',
    points: 5,
    duration: 10
  })
);

const apiRouter = express.Router();

apiRouter.use('/api', async (_, res, next) => {
  try {
    await rateLimiter.consume(1);
  } catch (err) {
    console.log('Too many requests');

    return res.status(429).end();
  }

  next();
});

apiRouter.use('/api', (req, res, next) => {
  // TOTP is skipped for localhost connection
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '127.0.0.1') {
    return next();
  }

  const authenticatorTotp = req.headers['x-authenticator-totp'];

  authenticator.options = {
    ...authenticator.allOptions(),
    window: [7, 1]
  };

  try {
    const valid = authenticator.check(authenticatorTotp, AUTHENTICATOR_SECRET);

    if (!valid) {
      return res.status(401).end();
    }
  } catch (err) {
    console.log(err);

    return res.status(500).end();
  } finally {
    authenticator.resetOptions();
  }

  next();
});

apiRouter.use(
  '/api',
  cors({ origin: [/^http:\/\/localhost[:\/]/iu, 'https://hawo-acs-dev-appserver.azurewebsites.net'] })
);
apiRouter.use('/api', json());

apiRouter.get('/api/settings', (_, res) => {
  try {
    res.send(
      JSON.stringify({
        endpointURL: ACS_ENDPOINT_URL
      })
    );
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

apiRouter.post('/api/acs/chat/threads', async ({ body = {}, headers }, res) => {
  try {
    res.send(
      await createChatThread(body.topic || '', body.members || [], {
        endpointURL: ACS_ENDPOINT_URL,
        token: headers.authorization
      })
    );
  } catch (err) {
    console.log(err);
    res.status(502).end();
  }
});

apiRouter.get('/api/acs/chat/threads/:threadId/members', async ({ headers, params }, res) => {
  try {
    res.send(
      await listChatThreadMembers(params.threadId, {
        endpointURL: ACS_ENDPOINT_URL,
        token: headers.authorization
      })
    );
  } catch (err) {
    console.log(err);
    res.status(502).end();
  }
});

apiRouter.post('/api/acs/chat/threads/:threadId/members', async ({ body = {}, headers, params }, res) => {
  try {
    res.send(
      await addChatThreadMembers(params.threadId, body.members || [], {
        endpointURL: ACS_ENDPOINT_URL,
        token: headers.authorization
      })
    );
  } catch (err) {
    console.log(err);
    res.status(502).end();
  }
});

apiRouter.post('/api/acs/identities/:id/token', async ({ body = {}, params }, res) => {
  try {
    res.send(await issueToken(params.id, body.scopes || [], { endpointURL: ACS_ENDPOINT_URL, key: ACS_KEY }));
  } catch (err) {
    console.log(err);
    res.status(502).end();
  }
});

apiRouter.post('/api/acs/identities', async (_, res) => {
  try {
    res.send(await createIdentity({ endpointURL: ACS_ENDPOINT_URL, key: ACS_KEY }));
  } catch (err) {
    console.log(err);
    res.status(502).end();
  }
});

app.use(apiRouter);
app.use(express.static(PUBLIC_PATH));

app.listen(PORT, () => {
  console.log(`API server listening to port ${PORT} and serving static at ${PUBLIC_PATH}`);
});
