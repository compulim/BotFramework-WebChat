import { WebChatActivity } from './WebChatActivity';
import { WebChatNotification } from './WebChatNotification';
import { WebChatTypingUsers } from './WebChatTypingUsers';

export type ChatAdapter = {
  /** List of activities. This list may include local outgoing activities that is not completely delivered to the chat provider. */
  activities?: WebChatActivity[];

  /** Sends a typing indicator. */
  emitTypingIndicator?: () => void;

  /** List of notifications, including connectivity status. */
  notifications?: WebChatNotification[];

  /** Resends an activity by its tracking number. */
  resend?: (trackingNumber: string) => string;

  /** Returns a read receipt for an activity. */
  returnReadReceipt?: (activity: WebChatActivity) => void;

  /**
   * Sends a message.
   *
   * @return {string} Tracking number of the message. Can be used to resend the message.
   */
  sendMessage?: (message: string) => string;

  /** List of users who are actively typing. */
  typingUsers?: WebChatTypingUsers;

  /** The user ID. */
  userId?: string;

  /** The username. */
  username?: string;
};
