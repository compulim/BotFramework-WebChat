import { useContext } from 'react';

import { useSelector } from './internal/WebChatReduxContext';
import WebChatSpeechContext from './internal/WebChatSpeechContext';

// TODO: Add options to support: "all" (default), "render" and "speechsynthesis".
export default function useActivities(options = 'all') {
  const allActivities = useSelector(({ activities }) => activities);
  const speechContext = useContext(WebChatSpeechContext);

  if (options === 'speechsynthesis') {
    if (!speechContext) {
      throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
    }

    return [speechContext.synthesizingActivities];
  }

  return [allActivities];
}
