/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.Execute action', () => {
  test('should refresh card', () => runHTML('adaptiveCards.applet.action.execute.card.html'));
});
