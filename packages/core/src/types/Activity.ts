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

    /** Read by who. If undefined, it is not read by anyone, or the provider does not support read receipts. */
    'webchat:read-by'?: ReadBy;

    /** Tracking number. If undefined, the activity was sent from another session, or the chat adapter does not support resend. */
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

// TODO: Implement PropTypes.

const EventActivityFromOthers = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:key': PropTypes.string.isRequired,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['others'])
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['bot'])
  }),
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['event']),
  value: PropTypes.any
});

const EventActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['self']),
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user'])
  }),
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['event']),
  value: PropTypes.any
});

const EventActivityFromService = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:key': PropTypes.string.isRequired,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['service'])
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['channel'])
  }),
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['event']),
  value: PropTypes.any
});

const MessageActivityFromOthers = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:key': PropTypes.string.isRequired,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['others'])
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['bot'])
  }),
  id: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']),
  text: PropTypes.string,
  textFormat: TextFormatPropTypes
});

const MessageActivityFromSelf = PropTypes.shape({
  channelData: PropTypes.shape({
    'webchat:delivery-status': DeliveryStatusPropTypes,
    'webchat:key': PropTypes.string.isRequired,
    'webchat:read-by': ReadByPropTypes,
    'webchat:sender:image': PropTypes.string,
    'webchat:sender:initials': PropTypes.string,
    'webchat:sender:name': PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf(['__BOT__'])]),
    'webchat:sender:who': PropTypes.oneOf(['self']),
    'webchat:tracking-number': PropTypes.string
  }),
  conversationId: PropTypes.string,
  from: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.oneOf(['user'])
  }),
  id: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['message']),
  text: PropTypes.string,
  textFormat: TextFormatPropTypes
});

export const ActivityPropTypes = PropTypes.oneOf([
  EventActivityFromOthers,
  EventActivityFromSelf,
  EventActivityFromService,
  MessageActivityFromOthers,
  MessageActivityFromSelf
]) as PropTypes.Validator<Activity>;
