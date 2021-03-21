export type WebChatNotification = {
  alt?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data?: any;
  id: string;
  level?: 'error' | 'info' | 'success' | 'warn';
  message?: string;
};
