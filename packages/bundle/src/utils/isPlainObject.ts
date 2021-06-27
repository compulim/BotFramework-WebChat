export default function isPlainObject(obj: any) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}
