import { ACSChatThreadMember } from '../types/ACSChatThreadMember';

export default function createACSTypingUserToWebChatTypingEntry(
  userId: string
): (
  acsTypingUser: ACSChatThreadMember
) => [
  string,
  {
    name: string;
    role: 'bot' | 'user';
    who: 'others' | 'self';
  }
] {
  return (acsTypingUser: ACSChatThreadMember) => {
    const {
      user: { communicationUserId }
    } = acsTypingUser;

    const who = userId === communicationUserId ? 'self' : 'others';

    return [
      communicationUserId,
      {
        name: communicationUserId,
        role: who === 'self' ? 'user' : 'bot',
        who
      }
    ];
  };
}
