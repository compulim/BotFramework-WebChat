// TODO: Use the type from @azure/communication-chat.
type ACSChatParticipant = {
  displayName?: string;
  shareHistoryTime?: Date;
  user: {
    communicationUserId: string;
  };
};

export default ACSChatParticipant;
