import { useContext } from 'react';

import EmitTypingContext from '../contexts/EmitTypingContext';

export default function useEmitTyping(): (start: boolean) => void {
  return useContext(EmitTypingContext);
}
