import PropTypes from 'prop-types';

import Activity, { ActivityPropTypes } from './Activity';
import Notifications, { NotificationsPropTypes } from './Notifications';
import TypingUsers, { TypingUsersPropTypes } from './TypingUsers';

type ChatAdapter = {
  /**
   * List of activities.
   *
   * This list may include local outgoing activities that is not completely delivered to the chat provider.
   */
  activities?: Activity[];

  /**
   * Emit start and stop typing signal with best effort.
   *
   * @param {boolean} started - True to emit start typing signal, false to emit stop typing signal.
   */
  emitTyping?: (started: boolean) => void;

  /**
   * True, if the chat adapter will honor read receipts, otherwise, false.
   *
   * If the chat adapter does not support read receipts, it should return `undefined`.
   *
   * When the chat adapter is initialized, this should be set to `true`.
   */
  honorReadReceipts?: boolean;

  /** List of notifications, including connectivity status. */
  notifications?: Notifications;

  /** Resends an activity by its tracking number. */
  resend?: (trackingNumber: string) => string;

  /**
   * Send an event.
   *
   * @return {string} Tracking number of the message. Can be used to resend the event.
   */
  sendEvent?: (name: string, value: any) => string;

  /**
   * Send files.
   *
   * @return {string} Tracking number of the message. Can be used to resend files.
   */
  sendFiles?: (
    // TODO: We should update this signature to use ArrayBuffer instead.
    files: {
      /** Name of the file. */
      name?: string;

      /** Size (in bytes) of the file. */
      size?: number;

      /** URL of the thumbnail. */
      thumbnail?: string;

      /** URL of the file. */
      url: string;
    }[]
  ) => string;

  /**
   * Sends a message.
   *
   * @return {string} Tracking number of the message. Can be used to resend the message.
   */
  sendMessage?: (message: string) => string;

  /**
   * Sends a message back.
   *
   * @return {string} Tracking number of the message. Can be used to resend the message back.
   */
  sendMessageBack?: (value: any, text?: string, displayText?: string) => string;

  /**
   * Sends a post back.
   *
   * @return {string} Tracking number of the message. Can be used to resend the post back.
   */
  sendPostBack?: (value: string) => string;

  /**
   * Set if the chat adapter should honor read receipts. When set to `true`, the chat adapter will immediately send read receipts for all current activities.
   *
   * Chat UI can set this to `false` when not in foreground or being obscurred.
   *
   * If the chat adapter does not support read receipts, it should return `undefined`.
   */
  setHonorReadReceipts?: (honorReadReceipts: boolean) => void;

  /** List of users who are actively typing. */
  typingUsers?: TypingUsers;

  // TODO: Can Web Chat works without userID? Seems cannot because our end-dev may need the user ID.
  /** The user ID. */
  userId?: string;

  // TODO: Can Web Chat works without username?
  /** The username. */
  username?: string;
};

export default ChatAdapter;

export const ChatAdapterPropTypes = PropTypes.shape({
  activities: PropTypes.arrayOf(ActivityPropTypes),
  emitTyping: PropTypes.func,
  honorReadReceipts: PropTypes.bool,
  notifications: NotificationsPropTypes,
  resend: PropTypes.func,
  sendEvent: PropTypes.func,
  sendFiles: PropTypes.func,
  sendMessage: PropTypes.func,
  sendMessageBack: PropTypes.func,
  sendPostBack: PropTypes.func,
  setHonorReadReceipts: PropTypes.func,
  typingUsers: TypingUsersPropTypes,
  userId: PropTypes.string,
  username: PropTypes.string
}) as PropTypes.Validator<ChatAdapter>;
