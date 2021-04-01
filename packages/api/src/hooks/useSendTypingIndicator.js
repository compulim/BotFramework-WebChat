import { useContext } from '../contexts/internal/TypingContext';

export default function useSendTypingIndicator() {
  return [useContext().sendTypingIndicator];
}
