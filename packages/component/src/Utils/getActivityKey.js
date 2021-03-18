export default function getActivityKey(activity) {
  if (!activity) {
    return;
  }

  const { channelData: { clientActivityID, 'webchat:key': key } = {}, id } = activity;

  return key || clientActivityID || id;
}
