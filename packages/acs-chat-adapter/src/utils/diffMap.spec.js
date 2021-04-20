import diffMap from './diffMap';

test('Unchanged and same instance', () => {
  const input = new Map(Object.entries({ one: 1, two: 2, three: 3 }));
  const result = diffMap(input, input);

  expect(result).toHaveProperty('size', 0);
});

test('Unchanged and different instance', () => {
  const result = diffMap(
    new Map(Object.entries({ one: 1, two: 2, three: 3 })),
    new Map(Object.entries({ one: 1, two: 2, three: 3 }))
  );

  expect(result).toHaveProperty('size', 0);
});

test('Added', () => {
  const result = diffMap(
    new Map(Object.entries({ one: 1, two: 2, three: 3 })),
    new Map(Object.entries({ zero: 0, one: 1, two: 2, three: 3, four: 4 }))
  );

  expect(Array.from(result.entries())).toEqual([
    ['zero', [undefined, 0]],
    ['four', [undefined, 4]]
  ]);
});

test('Removed', () => {
  const result = diffMap(
    new Map(Object.entries({ zero: 0, one: 1, two: 2, three: 3, four: 4 })),
    new Map(Object.entries({ one: 1, two: 2, three: 3 }))
  );

  expect(Array.from(result.entries())).toEqual([
    ['zero', [0, undefined]],
    ['four', [4, undefined]]
  ]);
});

test('Added and removed', () => {
  const result = diffMap(
    new Map(Object.entries({ one: 1, two: 2, three: 3 })),
    new Map(Object.entries({ two: 2, three: 3, four: 4 }))
  );

  expect(Array.from(result.entries())).toEqual([
    ['one', [1, undefined]],
    ['four', [undefined, 4]]
  ]);
});

test('Throw if the first argument is not a Map', () => {
  expect(() => diffMap(undefined, new Map())).toThrowError();
  expect(() => diffMap(null, new Map())).toThrowError();
  expect(() => diffMap(1, new Map())).toThrowError();
  expect(() => diffMap('abc', new Map())).toThrowError();
  expect(() => diffMap(true, new Map())).toThrowError();
  expect(() => diffMap(() => {}, new Map())).toThrowError();
  expect(() => diffMap({}, new Map())).toThrowError();
  expect(() => diffMap(new Date(), new Map())).toThrowError();
});

test('Throw if the second argument is not a Map', () => {
  expect(() => diffMap(new Map(), undefined)).toThrowError();
  expect(() => diffMap(new Map(), null)).toThrowError();
  expect(() => diffMap(new Map(), 1)).toThrowError();
  expect(() => diffMap(new Map(), 'abc')).toThrowError();
  expect(() => diffMap(new Map(), true)).toThrowError();
  expect(() => diffMap(new Map(), () => {})).toThrowError();
  expect(() => diffMap(new Map(), {})).toThrowError();
  expect(() => diffMap(new Map(), new Date())).toThrowError();
});
