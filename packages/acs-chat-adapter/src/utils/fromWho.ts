import Activity from '../types/Activity';
import Who from '../types/Who';

export default function fromWho(activity: Activity): Who {
  return activity.channelData['webchat:who'];
}
