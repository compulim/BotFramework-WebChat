import addEventListenerOnceWithUndo from './addEventListenerOnceWithUndo';
import addEventListenerWithUndo from './addEventListenerWithUndo';
import setAttributeWithUndo from './setAttributeWithUndo';

const disabledHandler = event => {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
};

export default function disableElementWithUndo(element: HTMLElement): () => void {
  const undoStack: (() => void)[] = [];
  const isActive = element === document.activeElement;
  const tag = element.nodeName.toLowerCase();

  /* eslint-disable-next-line default-case */
  switch (tag) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      undoStack.push(setAttributeWithUndo(element, 'aria-disabled', 'true'));

      if (isActive) {
        undoStack.push(
          addEventListenerOnceWithUndo(element, 'blur', () =>
            undoStack.push(setAttributeWithUndo(element, 'disabled', 'disabled'))
          )
        );
      } else {
        undoStack.push(setAttributeWithUndo(element, 'disabled', 'disabled'));
      }

      if (tag === 'input' || tag === 'textarea') {
        undoStack.push(addEventListenerWithUndo(element, 'click', disabledHandler));
        undoStack.push(setAttributeWithUndo(element, 'readonly', 'readonly'));
      } else if (tag === 'select') {
        undoStack.push(
          ...[].map.call(element.querySelectorAll('option'), option =>
            setAttributeWithUndo(option, 'disabled', 'disabled')
          )
        );
      }

      break;
  }

  return () => undoStack.forEach(undo => undo && undo());
}
