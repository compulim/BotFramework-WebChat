// import PropTypes from 'prop-types';
// import React, { FC, useCallback, useMemo } from 'react';

// import { WebChatActivity } from '../types/WebChatActivity';
// import { WebChatReadReceipts } from '../types/WebChatReadReceipts';

// import { default as ReadReceiptsContext } from '../contexts/ReadReceiptsContext';
// import getActivityKey from '../utils/getActivityKey';
// import useACSReadReceiptsWithFetchAndSubscribe from '../hooks/useACSReadReceiptsWithFetchAndSubscribe';
// import useActivities from '../hooks/useActivities';
// import useMapper from '../hooks/useMapper';

// type WebChatReadReceiptEntry = {
//   [userId: string]: boolean;
// };

// const ReadReceiptsComposer: FC = ({ children }) => {
//   const [acsReadReceipts] = useACSReadReceiptsWithFetchAndSubscribe();
//   const [activities] = useActivities();

//   // {
//   //   chatMessageId: string;
//   //   readOn: Date;
//   //   sender: {
//   //     communicationUserId: string;
//   //   }
//   // }

//   const lastReadsByMemberId = useMemo(
//     () =>
//       acsReadReceipts.reduce<{
//         [userId: string]: number;
//       }>((senderLastReads, { readOn, sender: { communicationUserId } }) => {
//         senderLastReads[communicationUserId] = Math.max(senderLastReads[communicationUserId] || 0, +readOn);

//         return senderLastReads;
//       }, {}),
//     [acsReadReceipts]
//   );

//   // TODO: We should read "memberIds" from ACS.
//   const memberIds = useMemo(() => Object.keys(lastReadsByMemberId), [lastReadsByMemberId]);

//   const mapActivityToReadReceiptEntry = useCallback(
//     (activity: WebChatActivity): [string, WebChatReadReceiptEntry] => {
//       const { createdOn } = activity;
//       const key = getActivityKey(activity);
//       const readReceiptEntries = memberIds.map<[string, boolean]>(memberId => [
//         memberId,
//         !!createdOn && lastReadsByMemberId[memberId] >= createdOn
//       ]);

//       return [key, Object.fromEntries(readReceiptEntries)];
//     },
//     [lastReadsByMemberId]
//   );

//   const readReceiptEntries = useMapper<WebChatActivity, [string, WebChatReadReceiptEntry]>(
//     activities,
//     mapActivityToReadReceiptEntry
//   );

//   const readReceipts = useMemo<WebChatReadReceipts>(() => Object.fromEntries(readReceiptEntries), [readReceiptEntries]);

//   // {
//   //   "activity-id-1": {
//   //     "user-id-1": true, // read by user-id-1
//   //     "user-id-2": false // not read by user-id-2
//   //   }
//   // }

//   return <ReadReceiptsContext.Provider value={readReceipts}>{children}</ReadReceiptsContext.Provider>;
// };

// ReadReceiptsComposer.defaultProps = {
//   children: undefined
// };

// ReadReceiptsComposer.propTypes = {
//   children: PropTypes.any
// };

// export default ReadReceiptsComposer;
