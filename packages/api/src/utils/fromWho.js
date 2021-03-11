export default function fromWho(activity) {
  return activity.who || (activity.from.role === 'user' ? 'self' : 'others');
}
