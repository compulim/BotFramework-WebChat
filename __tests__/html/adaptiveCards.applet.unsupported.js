/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet', () => {
  test('should disable error when initially show an unsupported card', () => runHTML('adaptiveCards.applet.unsupported.html'));
});
