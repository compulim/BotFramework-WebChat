/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet', () => {
  test('should react to "disabled" props', () => runHTML('adaptiveCards.applet.disabled.html'));
});
