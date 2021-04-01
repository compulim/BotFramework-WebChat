export default function deleteKey(map, key) {
  if (!map) {
    return map;
  }

  const { [key]: _, ...nextMap } = map;

  return nextMap;
}
