/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet', () => {
  test('should react to "adaptiveCardsParserMaxVersion" props', () => runHTML('adaptiveCards.applet.adaptiveCardsParserMaxVersion.html'));
});
