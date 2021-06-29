/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackingTiming', () => {
  test('should track rejecting sync function', () => runHTML('hooks.useTrackTiming.sync.reject.html'));
});
