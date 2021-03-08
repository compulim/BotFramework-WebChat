import { useMemo } from 'react';

import createACSMessageToWebChatActivityConverter from '../util/createACSMessageToWebChatActivityConverter';
import useACSIdentity from './useACSIdentity';
import useChatMessagesWithFetchAndSubscribe from './useChatMessagesWithFetchAndSubscribe';
import useMapper from './useMapper';

let EMPTY_ARRAY;

export default function useWebChatActivities() {
  // Lazy initializing constants to save loading speed and memory
  EMPTY_ARRAY || (EMPTY_ARRAY = []);

  const chatMessages = useChatMessagesWithFetchAndSubscribe() || EMPTY_ARRAY;
  const identity = useACSIdentity();

  const messageToActivity = useMemo(() => createACSMessageToWebChatActivityConverter({ identity }), [identity]);

  return useMapper(chatMessages, messageToActivity);
}
