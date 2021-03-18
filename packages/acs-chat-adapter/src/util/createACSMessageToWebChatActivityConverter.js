import createDebug from './debug';
import styleConsole from './styleConsole';

let debug;

// TODO: Verify this logic with ACS team to see if this is correct.
function isOthersUserId(userId) {
  return userId.startsWith('8:');
}

// "threadId" is undefined for messages from others, so we prefer to use the "threadId" from setup.
export default function createACSMessageToWebChatActivityConverter({ threadId, userId }) {
  debug ||
    (debug = createDebug('util:acsMessageToWebChatActivity', {
      backgroundColor: 'lightgray',
      color: 'black'
    }));

  return (acsChatMessage, readAt) => {
    const now = new Date();
    const {
      clientMessageId,
      content,
      createdOn,
      id,
      sender: { communicationUserId },
      senderDisplayName,
      type
    } = acsChatMessage;

    const role = userId === communicationUserId ? 'user' : 'bot';
    const who = userId === communicationUserId ? 'self' : isOthersUserId(userId) ? 'others' : 'service';

    // TODO: Assert data if it met our expectation.
    if (who === 'self') {
      // Assertion: to work properly, every activity must contains an ID during their lifetime, and this ID must not be changed during any moment of its life.
      if (!clientMessageId && !id) {
        // TODO: Check if conversation history contains "clientMessageId".
        // TODO: After the message is sent and echoed back from ACS, the "clientMessageId" is gone.
        //       This is crucial for the operation of Web Chat, because, if we can't reference the same message, we will be creating new DOM elements.
        //       Creating new DOM elements will hurt accessibility (ARIA live region).
        debug('🔥🔥🔥 %cFor all self messages, "clientMessageId" and/or "id" must be set.%c', ...styleConsole('red'));
      }
    }

    return {
      channelData: {
        'acs:chat-message': acsChatMessage,
        'acs:chat-message-id': acsChatMessage.id,
        'acs:converted-at': now.toISOString(),
        'webchat:key': clientMessageId || id,
        'webchat:read-at': readAt,
        'webchat:who': who,

        // TODO: Maybe we should save this logic somewhere else, because Promise returned by useSendMessageWithSendReceipt() is exactly doing the same thing.
        //       Better to have single source of truth.
        ...(who === 'self' && { 'webchat:send-state': id ? 'sent' : 'sending' }) // If it contains "id", it's sent.
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
