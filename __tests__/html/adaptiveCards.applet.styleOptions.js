/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet', () => {
  test('should react to "styleOptions" props', () => runHTML('adaptiveCards.applet.styleOptions.html'));
});
