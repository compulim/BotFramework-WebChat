/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet', () => {
  test('should react to "renderMarkdown" props', () => runHTML('adaptiveCards.applet.renderMarkdown.html'));
});
