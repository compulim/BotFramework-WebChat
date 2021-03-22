import { Activity } from './Activity';
import { Notification } from './Notification';
import { TypingUsers } from './TypingUsers';

export type ChatAdapter = {
  /** List of activities. This list may include local outgoing activities that is not completely delivered to the chat provider. */
  activities?: Activity[];

  /** Emits a typing indicator with best effort. */
  emitTypingIndicator?: () => void;

  /** List of notifications, including connectivity status. */
  notifications?: Notification[];

  /** Resends an activity by its tracking number. */
  resend?: (trackingNumber: string) => string;

  /**
   * Returns a read receipt for an activity.
   *
   * If multiple activities arrives in a batch, this function will call with the last activity in this batch.
   * It is up to the chat adapter to decide how many read receipts should send to the chat service.
   */
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
