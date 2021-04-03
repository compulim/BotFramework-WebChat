import Activity from '../types/Activity';

export default function getActivityKey(activity: Activity): string | undefined {
  return activity && activity.channelData['webchat:key'];
}
