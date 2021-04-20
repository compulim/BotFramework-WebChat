import { useContext } from '../contexts/TypingContext';

// TODO: Should we have a newer "useActiveTyping" instead to stay backcompat?
//       Or if the first argument is not passed, we assume it is Infinity?
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
