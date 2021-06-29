/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackingTiming', () => {
  test('should track rejecting async function', () => runHTML('hooks.useTrackTiming.async.reject.html'));
});
