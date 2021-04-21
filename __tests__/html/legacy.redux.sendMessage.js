/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('legacy chat adapter', () => {
  test('should send message when dispatching WEB_CHAT/SEND_MESSAGE action', () =>
    runHTMLTest('legacy.redux.sendMessage.html'));
});
