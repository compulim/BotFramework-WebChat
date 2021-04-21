/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('legacy chat adapter', () => {
  test('should send message when dispatching DIRECT_LINE/POST_ACTIVITY action', () =>
    runHTMLTest('legacy.redux.postActivity.html'));
});
