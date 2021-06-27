/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.Submit action', () => {
  test('should send "PostBack" message', () => runHTML('adaptiveCards.applet.action.submit.postBack.html'));
});
