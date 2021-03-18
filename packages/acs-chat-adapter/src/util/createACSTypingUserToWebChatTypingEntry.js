export default function createACSTypingUserToWebChatTypingEntry(userId) {
  return acsTypingUser => {
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
