import { Activity } from './Activity';
import { Notification } from './Notification';
import { TypingUsers } from './TypingUsers';

export type ChatAdapter = {
  /** List of activities. This list may include local outgoing activities that is not completely delivered to the chat provider. */
  activities?: Activity[];

  /** Sends a typing indicator. */
  emitTypingIndicator?: () => void;

  /** List of notifications, including connectivity status. */
  notifications?: Notification[];

  /** Resends an activity by its tracking number. */
  resend?: (trackingNumber: string) => string;

  /** Returns a read receipt for an activity. */
  returnReadReceipt?: (activity: Activity) => void;

  /**
   * Sends a message.
   *
   * @return {string} Tracking number of the message. Can be used to resend the message.
   */
  sendMessage?: (message: string) => string;

  /** List of users who are actively typing. */
  typingUsers?: TypingUsers;

  /** The user ID. */
  userId?: string;

  /** The username. */
  username?: string;
};
