export type WebChatTypingUser = {
  at: number;
  name?: string;
  who: 'others' | 'self';
};
