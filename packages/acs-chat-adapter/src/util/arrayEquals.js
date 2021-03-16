export default function arrayEquals(x, y) {
  return x && y && x.length === y.length && x.every((element, index) => Object.is(element, y[index]));
}
