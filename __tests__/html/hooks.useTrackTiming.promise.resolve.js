/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackingTiming', () => {
  test('should track resolving promise', () => runHTML('hooks.useTrackTiming.promise.resolve.html'));
});
