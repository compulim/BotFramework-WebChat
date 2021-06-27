/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.Submit action', () => {
  test('should send "ImBack" message', () => runHTML('adaptiveCards.applet.action.submit.imBack.html'));
});
