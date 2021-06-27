export default function setAttributeWithUndo(
  element: HTMLElement,
  qualifiedName: string,
  nextValue: string
): () => void {
  const value = element.getAttribute(qualifiedName);

  if (value !== nextValue) {
    element.setAttribute(qualifiedName, nextValue);

    return () => (value ? element.setAttribute(qualifiedName, value) : element.removeAttribute(qualifiedName));
  }
}
