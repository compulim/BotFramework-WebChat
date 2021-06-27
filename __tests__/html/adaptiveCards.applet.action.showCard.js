/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.ShowCard action', () => {
  test('should append a new card', () => runHTML('adaptiveCards.applet.action.showCard.html'));
});
