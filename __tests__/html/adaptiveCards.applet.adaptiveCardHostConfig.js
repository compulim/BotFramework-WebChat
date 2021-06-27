/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet', () => {
  test('should react to "adaptiveCardHostConfig" props', () => runHTML('adaptiveCards.applet.adaptiveCardHostConfig.html'));
});
