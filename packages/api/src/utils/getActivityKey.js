export default function getActivityKey(activity) {
  return activity && (activity.key || (activity.channelData && activity.channelData.clientActivityID) || activity.id);
}
