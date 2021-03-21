import { WebChatActivity } from '../types/WebChatActivity';

export default function getActivityKey(activity: WebChatActivity): string | undefined {
  return activity && activity.channelData['webchat:key'];
}
