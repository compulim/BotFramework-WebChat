import getMetadata from './getMetadata';

export default function getActivityKey(activity) {
  return getMetadata(activity).key;
}
