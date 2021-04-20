// TODO: Write tests

export default function diffArray<T>(
  from: T[],
  to: T[]
): {
  added: T[];
  removed: T[];
} {
  if (!Array.isArray(from)) {
    throw new Error('The first argument must be an array.');
  } else if (!Array.isArray(to)) {
    throw new Error('The second argument must be an array.');
  }

  return {
    added: to.filter(value => !from.includes(value)),
    removed: from.filter(value => !to.includes(value))
  };
}
