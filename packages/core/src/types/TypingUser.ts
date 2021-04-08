type TypingUser = {
  /**
   * User's name to display in the typing indicator.
   *
   * If `undefined`, will fallback to user ID.
   *
   * If set to `__BOT__`, will fallback to "bot".
   */
  name?: string | '__BOT__';
};

export default TypingUser;
