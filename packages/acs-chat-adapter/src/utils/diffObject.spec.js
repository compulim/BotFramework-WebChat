import diffObject from './diffObject';

test('Unchanged and same instance', () => {
  const input = { one: 1, two: 2, three: 3 };
  const result = diffObject(input, input);

  expect(result).toEqual({});
});

test('Unchanged and different instance', () => {
  const result = diffObject({ one: 1, two: 2, three: 3 }, { one: 1, two: 2, three: 3 });

  expect(result).toEqual({});
});

test('Added', () => {
  const result = diffObject({ one: 1, two: 2, three: 3 }, { zero: 0, one: 1, two: 2, three: 3, four: 4 });

  expect(result).toEqual({ zero: [undefined, 0], four: [undefined, 4] });
});

test('Removed', () => {
  const result = diffObject({ zero: 0, one: 1, two: 2, three: 3, four: 4 }, { one: 1, two: 2, three: 3 });

  expect(result).toEqual({
    zero: [0, undefined],
    four: [4, undefined]
  });
});

test('Added and removed', () => {
  const result = diffObject({ one: 1, two: 2, three: 3 }, { two: 2, three: 3, four: 4 });

  expect(result).toEqual({
    one: [1, undefined],
    four: [undefined, 4]
  });
});

test('Throw if the first argument is not a Map', () => {
  expect(() => diffObject(undefined, {})).toThrowError();
  expect(() => diffObject(null, {})).toThrowError();
  expect(() => diffObject(1, {})).toThrowError();
  expect(() => diffObject('abc', {})).toThrowError();
  expect(() => diffObject(true, {})).toThrowError();
  expect(() => diffObject(() => {}, {})).toThrowError();
  expect(() => diffObject(new Date(), {})).toThrowError();
});

test('Throw if the second argument is not a Map', () => {
  expect(() => diffObject({}, undefined)).toThrowError();
  expect(() => diffObject({}, null)).toThrowError();
  expect(() => diffObject({}, 1)).toThrowError();
  expect(() => diffObject({}, 'abc')).toThrowError();
  expect(() => diffObject({}, true)).toThrowError();
  expect(() => diffObject({}, () => {})).toThrowError();
  expect(() => diffObject({}, new Date())).toThrowError();
});
