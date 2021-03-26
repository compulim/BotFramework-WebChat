import { ACSChatThreadMember } from '../types/ACSChatThreadMember';
import { TypingUser } from '../types/TypingUser';

export default function createACSTypingUserToWebChatTypingEntryConverter(): (
  acsTypingUser: ACSChatThreadMember
) => [string, TypingUser] {
  return (acsTypingUser: ACSChatThreadMember) => {
    const {
      user: { communicationUserId }
    } = acsTypingUser;

    return [
      communicationUserId,
      {
        at: Date.now(),
        name: communicationUserId
      }
    ];
  };
}
