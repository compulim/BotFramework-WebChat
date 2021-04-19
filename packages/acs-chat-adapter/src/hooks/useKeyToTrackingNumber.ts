import { useContext } from 'react';

import SendMessageContext from '../contexts/SendMessageContext2';

export default function useKeyToTrackingNumber(): [{ [key: string]: string }] {
  return [useContext(SendMessageContext).keyToTrackingNumber];
}
