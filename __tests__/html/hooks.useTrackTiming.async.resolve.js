/** @jest-environment ./packages/test/harness/src/host/jest/WebDriverEnvironment.js */

describe('useTrackingTiming', () => {
  test('should track resolving async function', () => runHTML('hooks.useTrackTiming.async.resolve.html'));
});
