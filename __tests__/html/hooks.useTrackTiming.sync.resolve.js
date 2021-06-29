/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackingTiming', () => {
  test('should track resolving sync function', () => runHTML('hooks.useTrackTiming.sync.resolve.html'));
});
