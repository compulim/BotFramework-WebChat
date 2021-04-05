import { ChatMessage } from '@azure/communication-chat';
import DeliveryStatus from './DeliveryStatus';
import ReadBy from './ReadBy';
import TextFormat from './TextFormat';
import Who from './Who';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Expando<T> = Omit<any, keyof T> & T;

type BaseActivity = {
  // TODO: Clean up the channel data, so only small and important information stay here.
  //       Today, "acs:chat-message" is used for returning RR (getting the "chatMessage.id" out).
  //       IMO, since we are not returning RR for a specific message (a.k.a. we don't care what the message that RR is referring to, we just care about time)
  //       We may not need this one. Every time a RR is sent, just grab the last others' message ID and send it out.
  channelData: Expando<{
    'acs:chat-message-id': string;

    'acs:debug:chat-message': ChatMessage;

    /** Client message ID of an outgoing activity. This ID is local and may not be delivered to the chat provider. */
    'acs:debug:client-message-id'?: string;
    'acs:debug:converted-at': string;

    // TODO: Rename to "webchat:sender:initials"
    /** Avatar initials of the sender. */
    'webchat:avatar:initials'?: string;

    // TODO: Rename to "webchat:sender:image"
    /** Avatar image of the sender. */
    'webchat:avatar:image'?: string;

    /** Permanent ID. This ID must always present and may never change during the lifetime of the activity. */
    'webchat:key': string;

    // TODO: Rename to "webchat:sender:name"
    /** Display name of the sender. Set to "__BOT__" if the sender is an unnamed bot. */
    'webchat:sender-name'?: string | '__BOT__';

    // TODO: Rename to "webchat:sender:who"
    /** Who the activity is send by. */
    'webchat:who': Who;
  }>;
  conversationId?: string;
  from: {
    id: string;

    /** This is the full name of the user. For bots, if this is same as `id`, assume it do not have a name. Web Chat do not use this name. */
    name?: string;
    role: 'bot' | 'channel' | 'user';
  };

  // TODO: Can server ID be optional?
  id: string;

  // TODO: Can timestamp be optional? Web Chat could manual timestamp it. How timestamp is used in Web Chat? We don't care about ordering any more.
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
    'webchat:delivery-status': DeliveryStatus;

    /** Read by who. If undefined, it is not read by anyone, or the provider does not support read receipts. */
    'webchat:read-by'?: ReadBy;

    /** Tracking number. If undefined, the activity was sent from another session, or the chat adapter does not support resend. */
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
  textFormat: TextFormat;
  type: 'message';
};

type Activity =
  // Supported activity type from others: event, message
  | (ActivityFromOthers & (EventActivity | MessageActivity))

  // Supported activity type from self: event, message
  | (ActivityFromSelf & (EventActivity | MessageActivity))

  // Supported activity type from service: event
  | (ActivityFromService & EventActivity);

export default Activity;
