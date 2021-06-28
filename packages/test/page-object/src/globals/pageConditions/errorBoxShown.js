import became from './became';
import errorBoxes from '../pageElements/errorBoxes';

const TIMEOUT = 1000;

export default function errorBoxShown(numErrorBox) {
  return typeof numErrorBox === 'number'
    ? became('exactly ${numErrorBox} error boxes are shown', () => errorBoxes().length === numErrorBox, TIMEOUT)
    : became('one or more error box is shown', () => errorBoxes().length, TIMEOUT);
}
