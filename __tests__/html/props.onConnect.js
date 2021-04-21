/**
 * @jest-environment ./__tests__/html/__jest__/WebChatEnvironment.js
 */

describe('"onConnect" props', () => {
  test('should be called after it is connected', () =>
    runHTMLTest('props.onConnect.html'));
});
