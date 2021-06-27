export default function addEventListenerWithUndo(
  element: HTMLElement,
  name: string,
  handler: EventListener
): () => void {
  element.addEventListener(name, handler);

  return () => element.removeEventListener(name, handler);
}
