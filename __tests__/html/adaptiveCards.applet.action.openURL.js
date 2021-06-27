/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.OpenUrl action', () => {
  test('should open a popup', () => runHTML('adaptiveCards.applet.action.openURL.html'));
});
