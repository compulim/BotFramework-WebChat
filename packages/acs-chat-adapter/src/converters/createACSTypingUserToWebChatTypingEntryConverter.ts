import { ACSChatThreadMember } from '../types/ACSChatThreadMember';
import { TypingUser } from '../types/TypingUser';
import { UserProfiles } from '../types/UserProfiles';

export default function createACSTypingUserToWebChatTypingEntryConverter(
  userProfiles: UserProfiles
): (acsTypingUser: ACSChatThreadMember) => [string, TypingUser] {
  return (acsTypingUser: ACSChatThreadMember) => {
    const {
      user: { communicationUserId }
    } = acsTypingUser;

    return [
      communicationUserId,
      {
        at: Date.now(),
        name: (userProfiles[communicationUserId] || {}).name || communicationUserId
      }
    ];
  };
}
