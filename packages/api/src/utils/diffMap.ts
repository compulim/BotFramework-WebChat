// TODO: Write tests

export default function diffMap<T>(
  from: { [key: string]: T },
  to: { [key: string]: T }
): {
  [key: string]: [T, T];
} {
  return Array.from(
    new Set<string>([...Object.keys(from), ...Object.keys(to)])
  ).reduce((result, key) => {
    if (!Object.is(from[key], to[key])) {
      result[key] = [from[key], to[key]];
    }

    return result;
  }, {});
}
