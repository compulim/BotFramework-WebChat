// TODO: Use the type from @azure/communication-chat.
type ACSParticipant = {
  displayName?: string;
  shareHistoryTime?: Date;
  user: {
    communicationUserId: string;
  };
};

export default ACSParticipant;
