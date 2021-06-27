export default function addEventListenerOnceWithUndo(
  element: HTMLElement,
  name: string,
  handler: EventListener
): () => void {
  /* eslint-disable-next-line prefer-const */
  let detach: () => void;

  const detachingHandler = (event: Event) => {
    try {
      handler(event);
    } finally {
      // IE11 does not support { once: true }, so we need to detach manually.
      detach();
    }
  };

  detach = () => element.removeEventListener(name, detachingHandler);

  element.addEventListener(name, detachingHandler, { once: true });

  return detach;
}
