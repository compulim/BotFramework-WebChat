import { useContext } from 'react';

import SendMessageContext from '../contexts/SendMessageContext';

let EMPTY_MAP;

export default function useKeyToTrackingNumber(): [{ [key: string]: string }] {
  EMPTY_MAP || (EMPTY_MAP = {});

  return [useContext(SendMessageContext).keyToTrackingNumber || EMPTY_MAP];
}
