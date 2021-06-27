/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('Adaptive Cards applet with Action.ToggleVisibility action', () => {
  test('should toggle visibility of a section', () => runHTML('adaptiveCards.applet.action.toggleVisibility.html'));
});
