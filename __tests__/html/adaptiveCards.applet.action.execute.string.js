/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.Execute action', () => {
  test('should replace by a string', () => runHTML('adaptiveCards.applet.action.execute.string.html'));
});
