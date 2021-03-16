import { useContext } from 'react';

import useWebChatActivitiesContext from './internal/useWebChatActivitiesContext';
import WebChatSpeechContext from './internal/WebChatSpeechContext';

export default function useActivities(options = 'all') {
  // TODO: Verify all activities are valid, e.g. contains channelData, etc.
  const { activities: allActivities } = useWebChatActivitiesContext();
  const speechContext = useContext(WebChatSpeechContext);

  if (options === 'speechsynthesis') {
    if (!speechContext) {
      throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
    }

    return [speechContext.synthesizingActivities];
  } else if (options === 'render') {
    // TODO: Support "render" options
    console.warn(
      'botframework-webchat: useActivities() currently does not support "render", falling back to all activities.'
    );
  }

  return [allActivities];
}
