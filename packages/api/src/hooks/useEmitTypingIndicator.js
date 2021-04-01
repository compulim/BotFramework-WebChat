import { useContext } from '../contexts/internal/TypingContext';

export default function useEmitTypingIndicator() {
  return useContext().emitTyping;
}
