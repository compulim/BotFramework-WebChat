export default function resolveFunction(fnOrValue) {
  if (typeof fnOrValue === 'function') {
    return fnOrValue();
  }

  return fnOrValue;
}
