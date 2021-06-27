import disableElementWithUndo from './disableElementWithUndo';
import setAttributeWithUndo from './setAttributeWithUndo';

export default function disableInputElementsWithUndo(element: HTMLElement, observeSubtree = true): () => void {
  const undoStack: (() => void)[] = [].map.call(element.querySelectorAll('button, input, select, textarea'), element =>
    disableElementWithUndo(element)
  );

  const tag = element.nodeName.toLowerCase();

  // Only set tabindex="-1" on focusable element. Otherwise, we will make <div> focusable by mouse.
  (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea') &&
    undoStack.push(setAttributeWithUndo(element, 'tabindex', '-1'));

  if (observeSubtree) {
    const observer = new MutationObserver(mutations =>
      mutations.forEach(({ addedNodes }) =>
        undoStack.push(...[].map.call(addedNodes, addedNode => disableInputElementsWithUndo(addedNode, false)))
      )
    );

    observer.observe(element, { childList: true, subtree: true });

    undoStack.push(() => observer.disconnect());
  }

  return () => undoStack.forEach(undo => undo && undo());
}
