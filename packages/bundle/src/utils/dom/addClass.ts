export default function addClass(element: HTMLElement, className: string): boolean {
  const classNames = new Set(element.className.split(' '));

  if (!classNames.has(className)) {
    classNames.add(className);

    element.className = Array.from(classNames).join(' ');

    return true;
  }

  return false;
}
