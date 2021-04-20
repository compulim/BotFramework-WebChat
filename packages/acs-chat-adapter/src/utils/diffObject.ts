// TODO: Write tests

export default function diffObject<T>(
  from: { [key: string]: T },
  to: { [key: string]: T }
): {
  [key: string]: [T, T];
} {
  if (Object.prototype.toString.call(from) !== '[object Object]') {
    throw new Error('The first argument must be a plain object.');
  } else if (Object.prototype.toString.call(to) !== '[object Object]') {
    throw new Error('The second argument must be a plain object.');
  }

  return Array.from(
    new Set<string>([...Object.keys(from), ...Object.keys(to)])
  ).reduce((result, key) => {
    const { [key]: fromValue } = from;
    const { [key]: toValue } = to;

    if (!Object.is(fromValue, toValue)) {
      result[key] = [fromValue, toValue];
    }

    return result;
  }, {});
}
