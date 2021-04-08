type BaseNotification = {
  alt?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data?: any;
  id: string;
  level?: 'error' | 'info' | 'success' | 'warn';
  message?: string;
};

type ConnectionNotification = Pick<BaseNotification, 'data' | 'id'> & {
  data: 'connecting' | 'connected' | 'fatal';
  id: 'connectivitystatus';
};

type Notification = BaseNotification | ConnectionNotification;

export default Notification;
