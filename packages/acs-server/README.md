## Testing Web Chat with ACS

To try out Web Chat integration with ACS, you can use the [HTML template here](https://github.com/compulim/BotFramework-WebChat/blob/feat-acs-chat-adapter/samples/01.getting-started/k.bundle-with-azure-communication-services/index.html). It will load `webchat.js` from my CI dev build.

Then, you will need to create new token and a new thread from your ACS resources. To make things simpler, you can use my ACS resources by going to https://hawo-acs-dev-appserver.azurewebsites.net/.

1. Put in the time-based one time password (TOTP)
2. Click "Get settings", this will test the connection and TOTP with the server
   -  Copy the endpoint URL to the HTML file
3. Click "Create an identity", this will create a new user
4. Click "Issue a token", this will create a token specific for the user (it is not bound to the thread)
   -  Copy this value to the HTML file
   -  This token is valid for 24 hours
5. Click "Create a thread", this will create a new thread, a.k.a. chatroom
   -  Copy this value to the HTML file

You will want to create 2 identities, same thread, and 2 HTML files, so they can talk to each other.

Note:

-  You can also use Web Chat in `create-react-app` by installing [NPM packages from my release](https://github.com/compulim/BotFramework-WebChat/releases/tag/feat-acs-chat-adapter). Currently it is not recommended as you will need to install 7 individual packages
-  You can use the specific `webchat.js` with Azure Bot Services as well, just refer to [our standard samples](https://microsoft.github.io/BotFramework-WebChat/) and replace the URL for `webchat.js`
-  It is not trivial to generate ACS tokens yourself, because of the design of its REST API prohibits generating token in a browser. You must create a server to generate the token. For details, you can refer to [ACS REST API documentations](https://docs.microsoft.com/en-us/rest/api/communication/)
