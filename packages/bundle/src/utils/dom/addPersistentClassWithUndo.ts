import addClass from './addClass';

export default function addPersistentClassWithUndo(element: HTMLElement, className: string): () => void {
  if (addClass(element, className)) {
    // After we add the class, keep observing the element to make sure the class is not removed.
    const observer = new MutationObserver(() => addClass(element, className));

    observer.observe(element, { attributes: true, attributeFilter: ['class'] });

    return () => {
      const classNames = new Set(element.className.split(' '));

      classNames.delete(className);

      element.className = Array.from(classNames).join(' ');
      observer.disconnect();
    };
  }
}
