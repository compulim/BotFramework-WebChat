import PropTypes from 'prop-types';

import DeliveryStatus, { DeliveryStatusPropTypes } from './DeliveryStatus';
import ReadBy, { ReadByPropTypes } from './ReadBy';
import TextFormat, { TextFormatPropTypes } from './TextFormat';
import Who from './Who';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Expando<T> = Omit<any, keyof T> & T;

type BaseActivity = {
  // TODO: Clean up the channel data, so only small and important information stay here.
  //       Today, "acs:chat-message" is used for returning RR (getting the "chatMessage.id" out).
  //       IMO, since we are not returning RR for a specific message (a.k.a. we don't care what the message that RR is referring to, we just care about time)
  //       We may not need this one. Every time a RR is sent, just grab the last others' message ID and send it out.
  channelData: Expando<{
    /** Permanent ID. This ID must always present and may never change during the lifetime of the activity. */
    'webchat:key': string;

    /** Avatar image of the sender. */
    'webchat:sender:image'?: string;

    /** Avatar initials of the sender. */
    'webchat:sender:initials'?: string;

    /** Display name of the sender. Set to "__BOT__" if the sender is an unnamed bot. */
    'webchat:sender:name'?: string | '__BOT__';

    /** Who the activity is send by. */
    'webchat:sender:who': Who;
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
    'webchat:sender:who': 'others';
  };
  from: {
    role: 'bot';
  };
};

type ActivityFromSelf = BaseActivity & {
  channelData: {
    /** Delivery status. If the provider does not support delivery report, must set to "sent". */
    'webchat:delivery-status': DeliveryStatus;

    /** Text to preserve in the transcript. */
    'webchat:message-back:display-text'?: string;

    /** Message subtype. If `undefined`, this is a normal message. */
    'webchat:message:subtype'?: 'imBack' | 'messageBack' | 'postBack';

    /** Read by who. If `undefined`, it is not read by anyone, or the provider does not support read receipts. */
    'webchat:read-by'?: ReadBy;

    /** Tracking number. If `undefined`, the activity was sent from another session, or the chat adapter does not support resend. */
    'webchat:tracking-number'?: string;

    /** This message was sent from us. */
    'webchat:sender:who': 'self';
  };
  from: {
    role: 'user';
  };
};

export type ActivityFromService = BaseActivity & {
  channelData: {
    'webchat:sender:who': 'service';
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

// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#im-back
export type IMBackActivity = {
  channelData: {
    'webchat:message:subtype': 'imBack';
  };
  text?: string; // This is (action.title || typeof action.value === 'string' ? action.value : undefined).
  textFormat: 'plain';
  type: 'message';
};

export type MessageActivity = {
  channelData: {
    'webchat:message:subtype': undefined;
  };
  text?: string;
  textFormat: TextFormat;
  type: 'message';
};

// In the latest version of Direct Line schema, this is the only activity that support JSON value.
// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#message-back
export type MessageBackActivity = {
  channelData: {
    'webchat:message-back:display-text'?: string; // Same as action.displayText
    'webchat:message:subtype': 'messageBack';
  };
  text?: string; // Same as action.text
  type: 'message';
  value?: any; // This is (typeof action.value !== 'boolean/number/string' ? action.value : undefined).
};

// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
type BasePostBackActivity = {
  channelData: {
    'webchat:message:subtype': 'postBack'; // This flag is used to hide the postBack activity from the transcript.
  };
  type: 'message';
};

// This is no longer supported in latest version of Direct Line schema.
// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
type PostBackAsJSONActivity = BasePostBackActivity & {
  value: any;
};

// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#post-back
type PostBackAsTextActivity = BasePostBackActivity & {
  text: string; // This is (typeof action.value === 'string' ? action.value : undefined).
};

export type PostBackActivity = PostBackAsJSONActivity | PostBackAsTextActivity;

type Activity =
  // Supported activity type from others: event, message
  | (ActivityFromOthers & (EventActivity | MessageActivity))

  // Supported activity type from self: event, message
  | (ActivityFromSelf & (EventActivity | IMBackActivity | MessageActivity | MessageBackActivity | PostBackActivity))

  // Supported activity type from service: event
  | (ActivityFromService & EventActivity);

export default Activity;

// TODO: Implement PropTypes.

const EventActivityFromOthers = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:key': PropTypes.string.isRequired,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['others']).isRequired
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['bot']).isRequired
  }),
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['event']).isRequired,
  value: PropTypes.any
});

const EventActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['self']).isRequired,
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user']).isRequired
  }),
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['event']).isRequired,
  value: PropTypes.any
});

const EventActivityFromService = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:key': PropTypes.string.isRequired,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['service']).isRequired
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['channel']).isRequired
  }),
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['event']).isRequired,
  value: PropTypes.any
});

const IMBackActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:message:subtype': PropTypes.oneOf(['imBack']).isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['self']).isRequired,
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user']).isRequired
  }),
  id: PropTypes.string.isRequired,
  text: PropTypes.string,
  textFormat: PropTypes.oneOf(['plain']),
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']).isRequired
});

const MessageActivityFromOthers = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:key': PropTypes.string.isRequired,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['others']).isRequired
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['bot']).isRequired
  }),
  id: PropTypes.string.isRequired,
  text: PropTypes.string,
  textFormat: TextFormatPropTypes,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']).isRequired
});

const MessageActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['self']).isRequired,
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user']).isRequired
  }),
  id: PropTypes.string.isRequired,
  text: PropTypes.string,
  textFormat: TextFormatPropTypes,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']).isRequired
});

const MessageBackActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:message-back:display-text': PropTypes.string,
    'webchat:message:subtype': PropTypes.oneOf(['messageBack']).isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['self']).isRequired,
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user']).isRequired
  }),
  id: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  text: PropTypes.string,
  textFormat: PropTypes.oneOf(['plain']),
  type: PropTypes.oneOf(['message']).isRequired,
  value: PropTypes.any
});

const PostBackAsJSONActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:message:subtype': PropTypes.oneOf(['postBack']).isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['self']).isRequired,
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user']).isRequired
  }),
  id: PropTypes.string.isRequired,
  textFormat: PropTypes.oneOf(['plain']),
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']).isRequired,
  value: PropTypes.any
});

const PostBackAsTextActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:message:subtype': PropTypes.oneOf(['postBack']).isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.string,
    'webchat:sender:who': PropTypes.oneOf(['self']).isRequired,
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user']).isRequired
  }),
  id: PropTypes.string.isRequired,
  text: PropTypes.string,
  textFormat: PropTypes.oneOf(['plain']),
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']).isRequired
});

export const ActivityPropTypes = PropTypes.oneOf([
  EventActivityFromOthers,
  EventActivityFromSelf,
  EventActivityFromService,
  IMBackActivityFromSelf,
  MessageActivityFromOthers,
  MessageActivityFromSelf,
  MessageBackActivityFromSelf,
  PostBackAsJSONActivityFromSelf,
  PostBackAsTextActivityFromSelf
]) as PropTypes.Validator<Activity>;
