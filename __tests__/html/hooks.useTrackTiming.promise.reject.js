/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackingTiming', () => {
  test('should track rejecting promise', () => runHTML('hooks.useTrackTiming.promise.reject.html'));
});
