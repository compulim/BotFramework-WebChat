// import { useCallback, useEffect, useMemo } from 'react';
// import random from 'math-random';

// import useACSSendMessageWithClientMessageId from './useACSSendMessageWithClientMessageId';
// import useActivities2 from './useActivities2';
// import useTrackingKeys from './internal/useTrackingKeys';

// export default function useSendMessageWithTrackingKey() {
//   const abortController = useMemo(() => new AbortController(), []);
//   const acsSendMessageWithClientMessageId = useACSSendMessageWithClientMessageId();
//   const [activities] = useActivities2();
//   const [, setTrackingKeys] = useTrackingKeys();

//   useEffect(() => () => abortController.abort(), [abortController]);

//   return useCallback(
//     message => {
//       const trackingKey = `t-${random().toString(36).substr(2, 10)}`;

//       (async function () {
//         const clientMessageId = await acsSendMessageWithClientMessageId(message);

//         if (!abortController.signal.aborted) {
//           setTrackingKeys(trackingKeys => ({
//             ...trackingKeys,
//             [trackingKey]: clientMessageId
//           }));
//         }
//       })();

//       setTrackingKeys(trackingKeys => ({
//         ...trackingKeys,
//         [trackingKey]: false
//       }));

//       return trackingKey;
//     },
//     [acsSendMessageWithClientMessageId]
//   );
// }
