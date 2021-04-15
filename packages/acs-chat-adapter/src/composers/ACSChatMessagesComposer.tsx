// import { useChatMessages } from '@azure/acs-ui-sdk/dist/providers/ChatThreadProvider';
// import { useFetchMessages, useSubscribeMessage } from '@azure/acs-ui-sdk';
// import AbortController from 'abort-controller-es5';
// import PropTypes from 'prop-types';
// import React, { FC, useEffect } from 'react';

// import ACSChatMessage from '../types/ACSChatMessage';
// import ACSChatMessagesContext from '../contexts/ACSChatMessagesContext';
// import createDebug from '../utils/debug';
// import styleConsole from '../utils/styleConsole';
// import useMapper from '../hooks/useMapper';

// // This helper is needed because:
// // - useChatMessages() won't return conversation history, but only new outgoing messages during this session
// // - But if we call fetchMessages() once, it will return conversation history
// // - But if we call useSubscribeMessage() on every render, it will return new incoming messages

// // I think the API design need some tweaks.

// let debug;
// let EMPTY_ARRAY;
// let PASSTHRU_FN;

// const ChatMessagesComposer: FC = ({ children }) => {
//   debug || (debug = createDebug('<ACSChatMessagesComposer>', { backgroundColor: 'yellow', color: 'black' }));
//   EMPTY_ARRAY || (EMPTY_ARRAY = []);
//   PASSTHRU_FN || (PASSTHRU_FN = value => value);

//   const fetchMessages = useFetchMessages();

//   // Required for conversation history.
//   useEffect(() => {
//     const abortController = new AbortController();

//     // eslint-disable-next-line wrap-iife
//     (async function () {
//       const now = Date.now();

//       debug('Initial fetch started');

//       const messages = await fetchMessages();

//       if (abortController.signal.aborted) {
//         return;
//       }

//       debug(
//         [
//           `Initial fetch done, took %c${Date.now() - now} ms%c for %c${messages.length}%c messages.`,
//           ...styleConsole('green'),
//           ...styleConsole('purple')
//         ],
//         [messages]
//       );
//     })();

//     return () => abortController.abort();
//   }, [fetchMessages]);

//   // Required for new incoming messages.
//   useSubscribeMessage();

//   const result: ACSChatMessage[] = useChatMessages() as ACSChatMessage[];

//   // TODO: useChatMessages() did not cache the array correctly.
//   const chatMessages = useMapper<ACSChatMessage, ACSChatMessage>(
//     result && result.length ? result : EMPTY_ARRAY,
//     PASSTHRU_FN
//   );

//   return <ACSChatMessagesContext.Provider value={chatMessages}>{children}</ACSChatMessagesContext.Provider>;
// };

// ChatMessagesComposer.defaultProps = {
//   children: undefined
// };

// ChatMessagesComposer.propTypes = {
//   children: PropTypes.any
// };

// export default ChatMessagesComposer;
