import { useContext } from '../contexts/TypingContext';

export default function useSendTypingIndicator() {
  return [useContext().sendTypingIndicator];
}
