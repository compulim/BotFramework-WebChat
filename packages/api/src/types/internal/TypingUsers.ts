type InternalTypingUsers = {
  [userId: string]: {
    /** Epoch time when the user start typing. */
    at: number;

    /** Display name of the user. */
    name: string;

    /** Deprecated: will always return Infinity. */
    expireAt: number;

    /** Deprecated: will always return "bot". */
    role: 'bot';
  };
};

export default InternalTypingUsers;
