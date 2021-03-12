import { useMemo } from 'react';

import createACSMessageToWebChatActivityConverter from '../util/createACSMessageToWebChatActivityConverter';
import useACSIdentity from './useACSIdentity';
import useChatMessagesWithFetchAndSubscribe from './useChatMessagesWithFetchAndSubscribe';
import useMemoAll from './useMemoAll';
import useReadReceiptsWithFetchAndSubscribe from './useReadReceiptsWithFetchAndSubscribe';

let EMPTY_ARRAY;

export default function useWebChatActivities() {
  // Lazy initializing constants to save loading speed and memory
  EMPTY_ARRAY || (EMPTY_ARRAY = []);

  const acsChatMessages = useChatMessagesWithFetchAndSubscribe() || EMPTY_ARRAY;
  const identity = useACSIdentity();

  // We assume there is no dupe read receipts, i.e. read receipt with same "chatMessageId" and same "sender.communicationUserId".
  const acsReadReceipts = useReadReceiptsWithFetchAndSubscribe() || EMPTY_ARRAY;

  const acsMessageToWebChatActivity = useMemo(() => createACSMessageToWebChatActivityConverter({ identity }), [
    identity
  ]);

  return useMemoAll(acsMessageToWebChatActivity, acsMessageToWebChatActivity =>
    acsChatMessages.map(acsChatMessage => {
      const { id: chatMessageId } = acsChatMessage;

      return acsMessageToWebChatActivity(
        acsChatMessage,
        // TODO: If read receipt is not supported in this chat message or thread, it should pass undefined instead of empty array.
        acsReadReceipts.filter(readReceipt => readReceipt.chatMessageId === chatMessageId)
      );
    })
  );
}
