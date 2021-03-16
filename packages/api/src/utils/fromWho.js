export default function fromWho(activity) {
  const { channelData: { 'webchat:who': who } = {}, from: { role } = {} } = activity;

  return who || (role === 'user' ? 'self' : 'others');
}
