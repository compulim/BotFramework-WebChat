export default function fromWho(activity) {
  const { channelData: { 'webchat:sender:who': who } = {}, from: { role } = {} } = activity;

  // TODO: Deprecate this.
  return who || (role === 'user' ? 'self' : 'others');
}
