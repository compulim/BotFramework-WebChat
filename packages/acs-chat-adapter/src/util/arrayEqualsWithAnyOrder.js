// TODO: Write unit tests
export default function arrayEqualsWithAnyOrder(x, y) {
  if (!x || !y || x.length !== y.length) {
    return false;
  }

  const yClone = [...y];

  return x.every(element => {
    const index = yClone.indexOf(element);

    if (~index) {
      // This is to prevent mistakes when the same element appears more than once in either array x or y.
      yClone.splice(index, 1);

      return true;
    }
  });
}
