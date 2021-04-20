import sequenceIdToSequenceNumber from './sequenceIdToSequenceNumber';

test('Reading a number should return as-is', () => {
  expect(sequenceIdToSequenceNumber(1)).toBe(1);
  expect(sequenceIdToSequenceNumber(0)).toBe(0);
  expect(sequenceIdToSequenceNumber(-1)).toBe(-1);
});

test('Reading a string should parse it', () => {
  expect(sequenceIdToSequenceNumber('1')).toBe(1);
  expect(sequenceIdToSequenceNumber('0')).toBe(0);
  expect(sequenceIdToSequenceNumber('-1')).toBe(-1);
});

test('Reading an empty string should return Infinity', () => {
  expect(sequenceIdToSequenceNumber('')).toBe(Infinity);
});

test('Reading undefined should return Infinity', () => {
  expect(sequenceIdToSequenceNumber()).toBe(Infinity);
});

test('Reading a boolean should return Infinity', () => {
  expect(sequenceIdToSequenceNumber(true)).toBe(Infinity);
  expect(sequenceIdToSequenceNumber(false)).toBe(Infinity);
});
