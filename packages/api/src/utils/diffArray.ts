// TODO: Write tests

export default function diffArray<T>(
  from: T[],
  to: T[]
): {
  added: T[];
  removed: T[];
} {
  return {
    added: to.filter(value => !from.includes(value)),
    removed: from.filter(value => !to.includes(value))
  };
}
