// TODO: Write tests

export default function diffObject<T>(
  from: { [key: string]: T },
  to: { [key: string]: T }
): {
  [key: string]: [T, T];
} {
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
