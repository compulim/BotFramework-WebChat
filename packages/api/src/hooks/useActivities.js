import { useContext } from 'react';

import useActivitiesContext from './internal/useActivitiesContext';
import warn from '../utils/warn';
import WebChatSpeechContext from './internal/WebChatSpeechContext';

export default function useActivities(options = 'all') {
  // TODO: Verify all activities are valid, e.g. contains channelData, etc.
  const { activities: allActivities, activitiesWithRenderer } = useActivitiesContext();
  const speechContext = useContext(WebChatSpeechContext);

  if (options === 'speech synthesis') {
    if (!speechContext) {
      throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
    }

    return [speechContext.synthesizingActivities];
  } else if (options === 'visible') {
    return [activitiesWithRenderer.map(({ activity }) => activity)];
  } else if (options === 'with renderer') {
    return [activitiesWithRenderer];
  } else if (options !== 'all') {
    warn(`unknown options "${options}", will return all activities`);
  }

  return [allActivities];
}
