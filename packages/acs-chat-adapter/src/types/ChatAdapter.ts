import Activity from './Activity';
import Notification from './Notification';
import TypingUsers from './TypingUsers';

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
   */
  honorReadReceipts?: true;

  /** List of notifications, including connectivity status. */
  notifications?: Notification[];

  /** Resends an activity by its tracking number. */
  resend?: (trackingNumber: string) => string;

  /**
   * Sends a message.
   *
   * @return {string} Tracking number of the message. Can be used to resend the message.
   */
  sendMessage?: (message: string) => string;

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

  // TODO: Can Web Chat works without userID?
  /** The user ID. */
  userId?: string;

  // TODO: Can Web Chat works without username?
  /** The username. */
  username?: string;
};

export default ChatAdapter;