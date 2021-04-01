import { useContext } from '../contexts/internal/TypingContext';

function useActiveTyping(): [
  {
    [userId: string]: {
      at: number;
      expireAt: number;
      name: string;
      role: 'bot';
    };
  }
] {
  const { typingUsers } = useContext();

  return [typingUsers];
}

export default useActiveTyping;
