import getMetadata from './getMetadata';

export default function fromWho(activity) {
  return getMetadata(activity).who;
}
