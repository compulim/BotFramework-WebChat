// TODO: Use the type from @azure/communication-chat.
type ACSChatThreadMember = {
  displayName?: string;
  shareHistoryTime?: Date;
  user: {
    communicationUserId: string;
  };
};

export default ACSChatThreadMember;
