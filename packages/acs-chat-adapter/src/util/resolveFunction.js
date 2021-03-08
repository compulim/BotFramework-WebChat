export default async function resolveFunction(fnOrValue) {
  if (typeof fnOrValue === 'function') {
    return await fnOrValue();
  }

  return await fnOrValue;
}
