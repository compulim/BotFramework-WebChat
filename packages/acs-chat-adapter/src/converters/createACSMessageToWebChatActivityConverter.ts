import { EventActivity, MessageActivity, updateMetadata } from 'botframework-webchat-core';

import ACSChatMessage from '../types/ACSChatMessage';
import Activity from '../types/Activity';
import createDebug from '../utils/debug';
import styleConsole from '../utils/styleConsole';
import UserProfiles from '../types/UserProfiles';

let debug;

// TODO: Verify this logic with ACS team to see if this is correct.
function isOthersUserId(userId: string) {
  return userId.startsWith('8:');
}

// "threadId" is undefined for messages from others, so we prefer to use the "threadId" from setup.
export default function createACSMessageToWebChatActivityConverter({
  threadId,
  userId,
  userProfiles
}: {
  threadId: string;
  userId: string;
  userProfiles: UserProfiles;
}): (chatMessage: ACSChatMessage) => Activity {
  debug ||
    (debug = createDebug('util:acsMessageToWebChatActivity', {
      backgroundColor: 'lightgray',
      color: 'black'
    }));

  return acsChatMessage => {
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

    const userProfile = userProfiles[communicationUserId];
    const who: 'others' | 'self' | 'service' =
      userId === communicationUserId ? 'self' : isOthersUserId(userId) ? 'others' : 'service';

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

    const senderName = (userProfile || {}).name || senderDisplayName;

    const baseActivity = updateMetadata(
      {
        channelData: {
          'acs:chat-message-id': acsChatMessage.id,
          'acs:debug:chat-message': acsChatMessage,
          'acs:debug:client-message-id': clientMessageId,
          'acs:debug:converted-at': now.toISOString()
        },
        conversationId: threadId,
        from: {
          id: communicationUserId,
          name: senderName
        },
        id: clientMessageId || id,
        timestamp: (createdOn ? (typeof createdOn === 'string' ? new Date(createdOn) : createdOn) : now).toISOString()
        // We are constructing activity, after calling updateMetadata(), we should have a full activity that conforms to Activity type.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      {
        avatarInitials: (userProfile || {}).initials,
        key: clientMessageId || id,
        senderName,
        who
      }
    );

    const activityContent: EventActivity | MessageActivity =
      // For an outgoing message which is pending send, it does not have "type" field set.
      // Right now, we are assuming the outgoing message is a text message.
      type === 'Text' || (!type && who === 'self')
        ? {
            text: content,
            textFormat: 'plain',
            type: 'message'
          }
        : {
            type: 'event',
            value: content
          };

    if (who === 'others') {
      return {
        ...baseActivity,
        ...activityContent
      };
    } else if (who === 'self') {
      return updateMetadata(
        {
          ...baseActivity,
          ...activityContent
        },
        {
          deliveryStatus: createdOn ? 'sent' : 'sending' // If it contains "createdOn", it's sent.
        }
      );
    }

    // who === 'service'
    return {
      ...baseActivity,
      type: 'event'
    };
  };
}
