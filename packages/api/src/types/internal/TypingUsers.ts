type InternalTypingUsers = {
  [userId: string]: {
    /** Epoch time when the user start typing. */
    at: number;

    /** Display name of the user. */
    name: string;
  };
};

export default InternalTypingUsers;
