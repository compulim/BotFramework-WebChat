export default function createACSMessageToWebChatActivityConverter({ identity }) {
  return message => {
    const now = new Date();
    const {
      clientMessageId,
      content,
      createdOn,
      id,
      sender: { communicationUserId },
      senderDisplayName,
      threadId,
      type
    } = message;

    const role = identity === communicationUserId ? 'user' : 'bot';
    const who = identity === communicationUserId ? 'self' : identity.startsWith('8:') ? 'others' : 'system';

    return {
      channelData: {
        'acs:converted-at': now.toISOString(),
        'acs:message': message,
        'webchat:key': clientMessageId || id,
        ...(who === 'self' && { 'webchat:send-state': id ? 'sent' : 'sending' }),
        'webchat:who': who
      },
      conversationId: threadId,
      from: {
        id: communicationUserId,
        name: senderDisplayName,
        role
      },
      id: clientMessageId || id,
      timestamp: (createdOn ? (typeof createdOn === 'string' ? new Date(createdOn) : createdOn) : now).toISOString(),
      // For an outgoing message which is pending send, it does not have "type" field set.
      // Right now, we are assuming the outgoing message is a text message.
      ...(type === 'Text' || (!type && who === 'self')
        ? {
            text: content,
            textFormat: 'plain',
            type: 'message'
          }
        : {
            type: 'event',
            value: content
          })
    };
  };
}
