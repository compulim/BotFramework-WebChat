import { Activity as CoreActivity } from 'botframework-webchat-core';
import { ChatMessage } from '@azure/communication-chat';

type ACSChannelData = {
  'acs:chat-message-id': string;

  'acs:debug:chat-message': ChatMessage;

  /** Client message ID of an outgoing activity. This ID is local and may not be delivered to the chat provider. */
  'acs:debug:client-message-id'?: string;
  'acs:debug:converted-at': string;
};

type Activity = CoreActivity & {
  channelData: ACSChannelData;
};

export default Activity;
