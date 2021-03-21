import { ChatMessage } from '@azure/communication-chat';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Expando<T> = Omit<any, keyof T> & T;

type BaseActivity = {
  channelData: Expando<{
    'acs:chat-message': ChatMessage;
    'acs:chat-message-id': string;

    /** Client message ID of an outgoing activity. This ID is local and may not be delivered to the chat provider. */
    'acs:client-message-id'?: string;
    'acs:converted-at': string;

    /** Permanent ID. This ID must always present and may never change during the lifetime of the activity. */
    'webchat:key': string;

    /** Who the activity is send by. */
    'webchat:who': 'others' | 'self' | 'service';
  }>;
  conversationId?: string;
  from: {
    id: string;
    name?: string;
    role: 'bot' | 'channel' | 'user';
  };
  id: string;
  timestamp: string;
  type: string;
};

type ActivityFromOthers = BaseActivity & {
  channelData: {
    'webchat:who': 'others';
  };
  from: {
    role: 'bot';
  };
};

type ActivityFromSelf = BaseActivity & {
  channelData: {
    /** Delivery status. If the provider does not support delivery report, must set to "sent". */
    'webchat:delivery-status': 'error' | 'sending' | 'sent';

    /** Read by who. If undefined, it is not read by anyone, or the provider does not support read receipts. */
    'webchat:read-by'?: 'some' | 'all';

    /** Tracking number. If undefined, the activity was sent from another session. */
    'webchat:tracking-number'?: string;

    /** This message was sent from us. */
    'webchat:who': 'self';
  };
  from: {
    role: 'user';
  };
};

export type ActivityFromService = BaseActivity & {
  channelData: {
    'webchat:who': 'service';
  };
  from: {
    role: 'channel';
  };
};

export type EventActivity = {
  name?: string;
  type: 'event';
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  value?: any;
};

export type MessageActivity = {
  text?: string;
  textFormat: 'markdown' | 'plain' | 'xml';
  type: 'message';
};

export type Activity =
  // Supported activity type from others: event, message
  | (ActivityFromOthers & (EventActivity | MessageActivity))

  // Supported activity type from self: event, message
  | (ActivityFromSelf & (EventActivity | MessageActivity))

  // Supported activity type from service: event
  | (ActivityFromService & EventActivity);
