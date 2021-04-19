// TODO: Write tests

export default function diffMap<K, V>(from: Map<K, V>, to: Map<K, V>): Map<K, [V, V]> {
  return Array.from(
    new Set<K>([...Array.from(from.keys()), ...Array.from(to.keys())])
  ).reduce((result, key) => {
    const fromValue = from.get(key);
    const toValue = to.get(key);

    return Object.is(fromValue, toValue) ? result : result.set(key, [fromValue, toValue]);
  }, new Map<K, [V, V]>());
}
