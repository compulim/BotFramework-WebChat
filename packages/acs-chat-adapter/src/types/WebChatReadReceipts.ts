import { WebChatReadReceipt } from './WebChatReadReceipt';

// {
//   "activity-id-1": {
//     "user-id-1": true, // read by user-id-1
//     "user-id-2": false // not read by user-id-2
//   }
// }

export type WebChatReadReceipts = {
  [activityId: string]: WebChatReadReceipt;
};
