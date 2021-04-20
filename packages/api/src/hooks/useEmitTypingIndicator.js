import { useContext } from '../contexts/TypingContext';

export default function useEmitTypingIndicator() {
  return useContext().emitTyping;
}
