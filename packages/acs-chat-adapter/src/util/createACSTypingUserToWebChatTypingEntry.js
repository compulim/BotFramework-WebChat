export default function createACSTypingUserToWebChatTypingEntry(identity) {
  return acsTypingUser => {
    const {
      user: { communicationUserId }
    } = acsTypingUser;

    const who = identity === communicationUserId ? 'self' : 'others';

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
