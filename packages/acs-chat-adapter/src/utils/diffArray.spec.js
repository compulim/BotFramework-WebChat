import diffArray from './diffArray';

test('Unchanged in same order', () => {
  const { added, removed } = diffArray([1, 2, 3], [1, 2, 3]);

  expect(added).toHaveLength(0);
  expect(removed).toHaveLength(0);
});

test('Unchanged in different order', () => {
  const { added, removed } = diffArray([1, 2, 3], [3, 2, 1]);

  expect(added).toHaveLength(0);
  expect(removed).toHaveLength(0);
});

test('Added in same order', () => {
  const { added, removed } = diffArray([1, 2, 3], [0, 1, 2, 3, 4]);

  expect(added).toEqual([0, 4]);
  expect(removed).toHaveLength(0);
});

test('Added in different order', () => {
  const { added, removed } = diffArray([1, 2, 3], [4, 3, 2, 1, 0]);

  expect(added).toEqual([4, 0]);
  expect(removed).toHaveLength(0);
});

test('Removed in same order', () => {
  const { added, removed } = diffArray([1, 2, 3, 4, 5], [2, 3, 4]);

  expect(added).toHaveLength(0);
  expect(removed).toEqual([1, 5]);
});

test('Removed in different order', () => {
  const { added, removed } = diffArray([1, 2, 3, 4, 5], [4, 3, 2]);

  expect(added).toHaveLength(0);
  expect(removed).toEqual([1, 5]);
});

test('Added and removed in same order', () => {
  const { added, removed } = diffArray([1, 2, 3], [2, 3, 4]);

  expect(added).toEqual([4]);
  expect(removed).toEqual([1]);
});

test('Added and removed in different order', () => {
  const { added, removed } = diffArray([1, 2, 3], [4, 3, 2]);

  expect(added).toEqual([4]);
  expect(removed).toEqual([1]);
});

test('Added from empty', () => {
  const { added, removed } = diffArray([], [1, 2, 3]);

  expect(added).toEqual([1, 2, 3]);
  expect(removed).toHaveLength(0);
});

test('Removed to empty', () => {
  const { added, removed } = diffArray([1, 2, 3], []);

  expect(added).toHaveLength(0);
  expect(removed).toEqual([1, 2, 3]);
});

test('Throw if the first argument is not an array', () => {
  expect(() => diffArray(undefined, [])).toThrowError();
  expect(() => diffArray(null, [])).toThrowError();
  expect(() => diffArray(1, [])).toThrowError();
  expect(() => diffArray('abc', [])).toThrowError();
  expect(() => diffArray(true, [])).toThrowError();
  expect(() => diffArray(() => {}, [])).toThrowError();
  expect(() => diffArray({}, [])).toThrowError();
  expect(() => diffArray(new Date(), [])).toThrowError();
});

test('Throw if the second argument is not an array', () => {
  expect(() => diffArray([], undefined)).toThrowError();
  expect(() => diffArray([], null)).toThrowError();
  expect(() => diffArray([], 1)).toThrowError();
  expect(() => diffArray([], 'abc')).toThrowError();
  expect(() => diffArray([], true)).toThrowError();
  expect(() => diffArray([], () => {})).toThrowError();
  expect(() => diffArray([], {})).toThrowError();
  expect(() => diffArray([], new Date())).toThrowError();
});
