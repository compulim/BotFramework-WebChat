/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.Execute action which throw error', () => {
  test('should not refresh card', () => runHTML('adaptiveCards.applet.action.execute.error.html'));
});
