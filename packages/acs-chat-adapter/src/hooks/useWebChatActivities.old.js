// import { useMemo } from 'react';
// import updateIn from 'simple-update-in';

// import createACSMessageToWebChatActivityConverter from '../util/createACSMessageToWebChatActivityConverter';
// import useACSIdentity from './useACSIdentity';
// import useChatMessagesWithFetchAndSubscribe from './useChatMessagesWithFetchAndSubscribe';
// import useGroupBy from './useGroupBy';
// import useMapper from './useMapper';
// import useReadReceiptsWithFetchAndSubscribe from './useReadReceiptsWithFetchAndSubscribe';

// let debug;
// let EMPTY_ARRAY;

// function acsReadReceiptsToWebChatReadAts([chatMessageId, readReceipts]) {
//   return [
//     chatMessageId,
//     readReceipts.reduce(
//       result,
//       ({ readOn, sender: { communicationUserId } }) => (
//         {
//           ...result,
//           [communicationUserId]: readOn
//         },
//         {}
//       )
//     )
//   ];
// }

// export default function useWebChatActivities() {
//   // Lazy initializing constants to save loading speed and memory
//   debug || (debug = createDebug('useWebChatActivities', { backgroundColor: 'lightgray', color: 'black' }));
//   EMPTY_ARRAY || (EMPTY_ARRAY = []);

//   const acsChatMessages = useChatMessagesWithFetchAndSubscribe() || EMPTY_ARRAY;
//   const identity = useACSIdentity();

//   // We assume there is no dupe read receipts, i.e. read receipt with same "chatMessageId" and same "sender.communicationUserId".
//   const acsReadReceipts = useReadReceiptsWithFetchAndSubscribe() || EMPTY_ARRAY;

//   const acsMessageToWebChatActivity = useMemo(() => createACSMessageToWebChatActivityConverter({ identity }), [
//     identity
//   ]);

//   const webChatActivitiesWithoutReadAts = useMapper(acsChatMessages, acsMessageToWebChatActivity);

//   // {
//   //   'id-1': [
//   //     { chatMessageId: 'id-1', readOn: Date, sender: { communicationUserId: 'u-1' } },
//   //     { chatMessageId: 'id-1', readOn: Date, sender: { communicationUserId: 'u-2' } }
//   //   ],
//   //   'id-2': [
//   //     { chatMessageId: 'id-2', readOn: Date, sender: { communicationUserId: 'u-1' } }
//   //   ]
//   // }
//   const acsReadReceiptsGroupedByChatMessageId = useGroupBy(acsReadReceipts, 'chatMessageId');

//   // [
//   //   ['id-1', [
//   //     { chatMessageId: 'id-1', readOn: Date, sender: { communicationUserId: 'u-1' } },
//   //     { chatMessageId: 'id-1', readOn: Date, sender: { communicationUserId: 'u-2' } }
//   //   ],
//   //   ['id-2', [
//   //     { chatMessageId: 'id-2', readOn: Date, sender: { communicationUserId: 'u-1' } }
//   //   ]
//   // ]
//   const acsReadReceiptsGroupedByChatMessageIdEntries = useMemo(
//     () => Object.entries(acsReadReceiptsGroupedByChatMessageId),
//     [acsReadReceiptsGroupedByChatMessageId]
//   );

//   // [
//   //   ['id-1', {
//   //     'u-1': Date,
//   //     'u-2': Date
//   //   }],
//   //   ['id-2', {
//   //     'u-1': Date
//   //   }]
//   // ]
//   const webChatReadAtsGroupedByChatMessageIdEntries = useMapper(
//     acsReadReceiptsGroupedByChatMessageIdEntries,
//     acsReadReceiptsToWebChatReadAts
//   );

//   // {
//   //   'id-1': {
//   //     'u-1': Date,
//   //     'u-2': Date
//   //   },
//   //   'id-2': {
//   //     'u-1': Date
//   //   }
//   // }
//   const webChatReadAtsGroupedByChatMessageId = useMemo(
//     () => Object.fromEntries(webChatReadAtsGroupedByChatMessageIdEntries),
//     [webChatReadAtsGroupedByChatMessageIdEntries]
//   );

//   // Adds "activity.channelData['webchat:read-at']" if it has a read receipt.
//   return useMemo(() => {
//     const webChatActivities = [...webChatActivitiesWithoutReadAts];

//     // Iterates through every activity, checks if we have a "readAt" map to add to "activity.channelData".
//     webChatActivities = updateIn(webChatActivities, [() => true], webChatActivity => {
//       // TODO: We assume "chatMessageId" in the read receipt is the ACS message.id, is this correct assumption?
//       const { id: chatMessageId } = webChatActivity;

//       const webChatReadAts = webChatReadAtsGroupedByChatMessageId[chatMessageId];

//       // If the activity has readAt, add it to "activity.channelData['webchat.read-at']".
//       return webChatReadAts
//         ? updateIn(webChatActivity, ['channelData', 'webchat:read-at'], () => webChatReadAts)
//         : webChatActivity;
//     });

//     return webChatActivities;
//   }, [webChatActivitiesWithoutReadAts, webChatReadAtsGroupedByChatMessageId]);
// }
